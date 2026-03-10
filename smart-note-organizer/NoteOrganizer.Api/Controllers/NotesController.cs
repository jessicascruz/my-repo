using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NoteOrganizer.Api.Data;
using NoteOrganizer.Api.Models;
using NoteOrganizer.Api.Services;
using System.Text.Json;

namespace NoteOrganizer.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly GeminiService _geminiService;

        public NotesController(AppDbContext context, GeminiService geminiService)
        {
            _context = context;
            _geminiService = geminiService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Note>>> GetNotes()
        {
            return await _context.Notes.OrderByDescending(n => n.UpdatedAt).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Note>> GetNote(int id)
        {
            var note = await _context.Notes.FindAsync(id);
            if (note == null) return NotFound();
            return note;
        }

        [HttpPost("generate")]
        public async Task<ActionResult<Note>> GenerateNote([FromBody] GenerateRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Text)) return BadRequest("Text is required.");

            try
            {
                var jsonResponse = await _geminiService.GenerateNoteFromTextAsync(request.Text);
                
                // Tratar possíveis blocos de markdown no retorno (frequente na Gemini)
                jsonResponse = jsonResponse.Replace("```json", "").Replace("```", "").Trim();
                
                var responseData = JsonSerializer.Deserialize<JsonElement>(jsonResponse);
                
                var note = new Note
                {
                    Title = responseData.GetProperty("title").GetString() ?? "Sem Título",
                    ContentJson = responseData.GetProperty("editorData").ToString(),
                    RawInput = request.Text
                };

                _context.Notes.Add(note);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetNote), new { id = note.Id }, note);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateNote(int id, Note note)
        {
            if (id != note.Id) return BadRequest();

            note.UpdatedAt = DateTime.UtcNow;
            _context.Entry(note).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!NoteExists(id)) return NotFound();
                throw;
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNote(int id)
        {
            var note = await _context.Notes.FindAsync(id);
            if (note == null) return NotFound();

            _context.Notes.Remove(note);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool NoteExists(int id) => _context.Notes.Any(e => e.Id == id);
    }

    public record GenerateRequest(string Text);
}
