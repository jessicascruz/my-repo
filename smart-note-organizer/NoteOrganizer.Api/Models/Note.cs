using System;
using System.ComponentModel.DataAnnotations;

namespace NoteOrganizer.Api.Models
{
    public class Note
    {
        public int Id { get; set; }
        
        [Required]
        public string Title { get; set; } = "Nova Nota";
        
        [Required]
        public string ContentJson { get; set; } = "{}";
        
        public string? RawInput { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
