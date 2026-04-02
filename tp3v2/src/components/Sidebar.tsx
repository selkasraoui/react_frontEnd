import styles from "./Sidebar.module.css";
import { NavLink } from "react-router-dom";

interface Project {
  id: string;
  name: string;
  color: string;
}

interface SidebarProps {
  projects: Project[];
  isOpen: boolean;
  onRenameProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
}

export default function Sidebar({
  projects,
  isOpen,
  onRenameProject,
  onDeleteProject
}: SidebarProps) {
  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
      <h2 className={styles.title}>Mes Projets</h2>

      <ul className={styles.list}>
        {projects.map((p) => (
          <li key={p.id} className={styles.projectItem}>

            {/* lien vers la page projet */}
            <NavLink
              to={`/projects/${p.id}`}
              className={({ isActive }) =>
                `${styles.item} ${isActive ? styles.active : ""}`
              }
            >
              <span
                className={styles.dot}
                style={{ background: p.color }}
              />
              {p.name}
            </NavLink>

            {/* boutons actions */}
            <div className={styles.actions}>

              {/* bouton modifier */}
              <button
                className={styles.editBtn}
                onClick={() => onRenameProject(p)}
              >
                Update
              </button>

              {/* bouton supprimer */}
              <button
                className={styles.deleteBtn}
                onClick={() => onDeleteProject(p.id)}
              >
                Delete
              </button>

            </div>

          </li>
        ))}
      </ul>
    </aside>
  );
}