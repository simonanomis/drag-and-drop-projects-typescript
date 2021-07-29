interface Validatable {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

function validate(validatableObject: Validatable) {
    let isValid = true;

    if(validatableObject.required) {
        isValid = isValid && validatableObject.value.toString().trim().length != 0;
    }

    if(validatableObject.minLength != null && typeof validatableObject.value === 'string') {
        isValid = isValid && validatableObject.value.length >= validatableObject.minLength;
    }

    if(validatableObject.maxLength != null && typeof validatableObject.value === 'string') {
        isValid = isValid && validatableObject.value.length <= validatableObject.maxLength;
    }

    if(validatableObject.min != null && typeof validatableObject.value === 'number') {
        isValid = isValid && validatableObject.value >= validatableObject.min;
    }

    if(validatableObject.max != null && typeof validatableObject.value === 'number') {
        isValid = isValid && validatableObject.value <= validatableObject.max;
    }

    return isValid;
}

function autobind(_: any, _1: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        get() {
            return originalMethod.bind(this);
        }
    };
    return adjDescriptor;
}

enum ProjectStatus {
    ACTIVE,
    FINISHED
}

class Project {
    constructor(public id: string,
                public title: string,
                public description: string,
                public people: number,
                public projectStatus: ProjectStatus) {
    }
}

type Listener<T> = (items: T[]) => void;

class State<T> {
    protected listeners: Listener<T>[] = [];

    addListener(listener: Listener<T>) {
        this.listeners.push(listener);
    }

}

//Manages the state of the app
class ProjectState extends State<Project>{

    private projects: Project[] = [];
    private static projectStateInstance: ProjectState;

    private constructor() {
        super();
    }

    static getInstance() {
        if(this.projectStateInstance) {
            return this.projectStateInstance;
        }
        this.projectStateInstance = new ProjectState();
        return this.projectStateInstance;
    }

    addProject(title: string, description: string, people: number) {
        const newProject = new Project(Math.random().toString(), title, description, people, ProjectStatus.ACTIVE);

        this.projects.push(newProject);

        for(const listener of this.listeners) {
            listener(this.projects.slice());//slice returns copy of the array, not the original
        }
    }
}

const projectState = ProjectState.getInstance();

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    templateElement: HTMLTemplateElement;
    hostElement: T;
    element: U;

    constructor(templateId: string, hostElementId: string, insertAtStart: boolean, newElementId?: string) {
        this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;;
        this.hostElement = document.getElementById(hostElementId)! as T;

        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as U;
        if(newElementId) {
            this.element.id = newElementId;
        }
        this.attach(insertAtStart);
    }
    private attach(insertAtStart: boolean) {
        this.hostElement.insertAdjacentElement(insertAtStart ? 'afterbegin': 'beforeend', this.element);
    }

    abstract configure(): void;
    abstract renderContent(): void;
}

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement>{
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        super('project-input', 'app', true,'user-input');

        this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;

        this.configure();
    }

    renderContent(): void {}

    configure(): void {
        this.element.addEventListener('submit', this.submitHandler)
    }

    private gatherUserInput(): [string, string, number] | void {
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;

        const titleValidatable: Validatable = {
            value: enteredTitle,
            required: true
        };
        const descValidatable: Validatable = {
            value: enteredDescription,
            required: true,
            minLength: 5
        };
        const peopleValidatable: Validatable = {
            value: +enteredPeople,
            required: true,
            min: 1,
            max: 5
        };

        if(!validate(titleValidatable) ||
            !validate(descValidatable) ||
            !validate(peopleValidatable)) {
            alert('Invalid input! Please try again!');
        } else {
            return [enteredTitle, enteredDescription, +enteredPeople];
        }
    }

    private clearInput(): void {
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';
    }

    @autobind
    private submitHandler(event: Event) {
        event.preventDefault();

        const userInput = this.gatherUserInput();
        if (Array.isArray(userInput)) {
            const [title, description, people] = userInput;
            console.log(title, description, people);
            projectState.addProject(title, description, people);
            this.clearInput();
        }
    }


}

class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> {
    private project: Project;

    get persons() {
        if(this.project.people === 1) {
            return '1 person';
        } else {
            return `${this.project.people} persons`
        }
    }

    constructor(hostId: string, project: Project) {
        super('single-project', hostId, false, project.id);
        this.project = project;

        this.configure();
        this.renderContent();
    }

    configure() {}

    renderContent() {
        this.element.querySelector('h2')!.textContent = this.project.title;
        this.element.querySelector('h3')!.textContent = this.persons + ' assigned.';
        this.element.querySelector('p')!.textContent = this.project.description;
    }
}

//Responsible for rendering the list of projects: 2 lists: active and inactive, so the id of the section is dynamic
class ProjectList extends Component<HTMLDivElement, HTMLElement>{
    assignedProjects: Project[];

    constructor(private typeOfProject: 'active' | 'finished') {
        super('project-list', 'app', false,`${typeOfProject}-projects`);

        this.assignedProjects = [];
        this.configure();
        this.renderContent();
    }

    private renderProjects() {
        const listElement = document.getElementById(`${this.typeOfProject}-projects-list`)! as HTMLUListElement;
        listElement.innerHTML = '';
        for(const projectItem of this.assignedProjects) {
           new ProjectItem(this.element.querySelector('ul')!.id, projectItem);
        }
    }

    configure() {
        projectState.addListener((projects: Project[]) => {
            const relevantProjects = projects.filter(project => {
                if(this.typeOfProject === 'active') {
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



const projectInput = new ProjectInput();
const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');