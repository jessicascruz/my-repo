using Microsoft.EntityFrameworkCore;
using NoteOrganizer.Api.Models;

namespace NoteOrganizer.Api.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Note> Notes => Set<Note>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Note>()
                .Property(n => n.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
            
            modelBuilder.Entity<Note>()
                .Property(n => n.UpdatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
        }
    }
}
