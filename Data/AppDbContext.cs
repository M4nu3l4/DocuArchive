using DocuArchive.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace DocuArchive.Data
{
    public class AppDbContext : IdentityDbContext<ApplicationUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Document> Documents { get; set; }

        public DbSet<Category> Categories { get; set; }

        public DbSet<ClientCompany> ClientCompanies { get; set; }

        public DbSet<DocumentWorkflowStatus> DocumentWorkflowStatuses { get; set; }

        public DbSet<DocumentActivityLog> DocumentActivityLogs { get; set; }

        public DbSet<Notification> Notifications { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Category>().HasData(
                new Category { Id = 1, Nome = "Contratti", Attiva = true },
                new Category { Id = 2, Nome = "Fatture", Attiva = true },
                new Category { Id = 3, Nome = "Documenti Interni", Attiva = true }
            );

            modelBuilder.Entity<Document>()
                .HasOne(d => d.LockedByUser)
                .WithMany()
                .HasForeignKey(d => d.LockedByUserId)
                .OnDelete(DeleteBehavior.Restrict);


            modelBuilder.Entity<DocumentActivityLog>()
                .HasOne(l => l.Document)
                .WithMany()
                .HasForeignKey(l => l.DocumentId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<DocumentWorkflowStatus>()
                .HasMany(s => s.Documents)
                .WithOne(d => d.WorkflowStatus)
                .HasForeignKey(d => d.WorkflowStatusId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<DocumentWorkflowStatus>().HasData(
                new DocumentWorkflowStatus
                {
                    Id = 1,
                    Nome = "Acquisita",
                    Colore = "secondary",
                    Attivo = true,
                    Ordine = 1
                },
                new DocumentWorkflowStatus
                {
                    Id = 2,
                    Nome = "In pending",
                    Colore = "warning",
                    Attivo = true,
                    Ordine = 2
                },
                new DocumentWorkflowStatus
                {
                    Id = 3,
                    Nome = "In lavorazione",
                    Colore = "primary",
                    Attivo = true,
                    Ordine = 3
                },
                new DocumentWorkflowStatus
                {
                    Id = 4,
                    Nome = "Attiva",
                    Colore = "success",
                    Attivo = true,
                    Ordine = 4
                },
                new DocumentWorkflowStatus
                {
                    Id = 5,
                    Nome = "Dismessa",
                    Colore = "danger",
                    Attivo = true,
                    Ordine = 5
                }
            );
            modelBuilder.Entity<Notification>()
                .HasOne(n => n.User)
                .WithMany()
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Notification>()
                .HasOne(n => n.Document)
                .WithMany()
                .HasForeignKey(n => n.DocumentId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Document>()
                .HasOne(d => d.AssignedToUser)
                .WithMany()
                .HasForeignKey(d => d.AssignedToUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Document>()
                .HasOne(d => d.AssignedByUser)
                .WithMany()
                .HasForeignKey(d => d.AssignedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ClientCompany>().HasData(
                new ClientCompany
                {
                    Id = 1,
                    RagioneSociale = "Tech Solutions SRL",
                    Email = "info@techsolutions.it",
                    Attivo = true
                },
                new ClientCompany
                {
                    Id = 2,
                    RagioneSociale = "Green Energy SPA",
                    Email = "contatti@greenenergy.it",
                    Attivo = true
                }
            );
        }
    }
}