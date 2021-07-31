namespace DDApp {
    type Listener<T> = (items: T[]) => void;

    class State<T> {
        protected listeners: Listener<T>[] = [];

        addListener(listener: Listener<T>) {
            this.listeners.push(listener);
        }

    }

//Manages the state of the app
    export class ProjectState extends State<Project> {

        private projects: Project[] = [];
        private static projectStateInstance: ProjectState;

        private constructor() {
            super();
        }

        static getInstance() {
            if (this.projectStateInstance) {
                return this.projectStateInstance;
            }
            this.projectStateInstance = new ProjectState();
            return this.projectStateInstance;
        }

        addProject(title: string, description: string, people: number) {
            const newProject = new Project(Math.random().toString(), title, description, people, ProjectStatus.ACTIVE);

            this.projects.push(newProject);

            this.updateListeners();
        }

        moveProject(projectId: string, newStatus: ProjectStatus) {
            const project = this.projects.find(p => p.id === projectId);
            if (project && project.projectStatus !== newStatus) {
                project.projectStatus = newStatus;
                this.updateListeners();
            }
        }

        private updateListeners() {
            for (const listener of this.listeners) {
                listener(this.projects.slice());//slice returns copy of the array, not the original
            }
        }
    }

    export const projectState = ProjectState.getInstance();
}