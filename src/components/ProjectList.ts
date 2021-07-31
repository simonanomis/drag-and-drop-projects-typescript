/// <reference  path="../state/ProjectState.ts"/>
/// <reference  path="../decorators/Autobind.ts"/>
/// <reference  path="BaseComponent.ts"/>
/// <reference  path="../models/IDragDrop.ts"/>
/// <reference  path="../models/Project.ts"/>

namespace DDApp{
    //Responsible for rendering the list of projects: 2 lists: active and inactive, so the id of the section is dynamic
    export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
        assignedProjects: Project[];

        constructor(private typeOfProject: 'active' | 'finished') {
            super('project-list', 'app', false, `${typeOfProject}-projects`);

            this.assignedProjects = [];
            this.configure();
            this.renderContent();
        }

        @autobind
        dragOverHandler(event: DragEvent): void {
            if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
                event.preventDefault();
                const listElement = this.element.querySelector('ul')!;
                listElement.classList.add('droppable');
            }
        }

        @autobind
        dropHandler(event: DragEvent): void {
            const projectId = event.dataTransfer!.getData('text/plain');
            projectState.moveProject(projectId, this.typeOfProject === 'active' ? ProjectStatus.ACTIVE : ProjectStatus.FINISHED);
        }

        @autobind
        dragLeaveHandler(_: DragEvent): void {
            const listElement = this.element.querySelector('ul')!;
            listElement.classList.remove('droppable');
        }

        private renderProjects() {
            const listElement = document.getElementById(`${this.typeOfProject}-projects-list`)! as HTMLUListElement;
            listElement.innerHTML = '';
            for (const projectItem of this.assignedProjects) {
                new ProjectItem(this.element.querySelector('ul')!.id, projectItem);
            }
        }

        configure() {
            this.element.addEventListener('dragover', this.dragOverHandler);
            this.element.addEventListener('dragleave', this.dragLeaveHandler);
            this.element.addEventListener('drop', this.dropHandler);

            projectState.addListener((projects: Project[]) => {
                const relevantProjects = projects.filter(project => {
                    if (this.typeOfProject === 'active') {
                        return project.projectStatus === ProjectStatus.ACTIVE;
                    }
                    return project.projectStatus === ProjectStatus.FINISHED;
                });
                this.assignedProjects = relevantProjects;
                this.renderProjects();
            });
        }

        renderContent() {
            const listId = `${this.typeOfProject}-projects-list`;
            this.element.querySelector('ul')!.id = listId;
            this.element.querySelector('h2')!.textContent = this.typeOfProject.toUpperCase() + ' PROJECTS';

        }
    }
}