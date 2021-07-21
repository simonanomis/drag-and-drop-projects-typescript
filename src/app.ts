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

type Listener = (items: Project[]) => void;


//Manages the state of the app
class ProjectState {
    private listeners: Listener[] = [];
    private projects: Project[] = [];
    private static projectStateInstance: ProjectState;

    private constructor() {
    }

    static getInstance() {
        if(this.projectStateInstance) {
            return this.projectStateInstance;
        }
        this.projectStateInstance = new ProjectState();
        return this.projectStateInstance;
    }

    addListener(listener: Listener) {
        this.listeners.push(listener);
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

class ProjectInput {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    formElement: HTMLFormElement;
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;;
        this.hostElement = document.getElementById('app')! as HTMLDivElement;

        const importedNode = document.importNode(this.templateElement.content, true);
        this.formElement = importedNode.firstElementChild as HTMLFormElement;
        this.formElement.id = 'user-input';

        this.titleInputElement = this.formElement.querySelector('#title') as HTMLInputElement;
        this.descriptionInputElement = this.formElement.querySelector('#description') as HTMLInputElement;
        this.peopleInputElement = this.formElement.querySelector('#people') as HTMLInputElement;

        this.configure();
        this.attach();
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

    private configure(): void {
        this.formElement.addEventListener('submit', this.submitHandler)
    }

    private attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.formElement);
    }
}

//Responsible for rendering the list of projects: 2 lists: active and inactive, so the id of the section is dynamic
class ProjectList {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    sectionElement: HTMLElement;
    assignedProjects: Project[];

    constructor(private typeOfProject: 'active' | 'finished') {
        this.templateElement = document.getElementById('project-list')! as HTMLTemplateElement;;
        this.hostElement = document.getElementById('app')! as HTMLDivElement;
        this.assignedProjects = [];

        const importedNode = document.importNode(this.templateElement.content, true);
        this.sectionElement = importedNode.firstElementChild as HTMLElement;
        this.sectionElement.id = `${this.typeOfProject}-projects`;

        projectState.addListener((projects: Project[]) => {
            const relevantProjects = projects.filter(project => {
                if(this.typeOfProject === 'active') {
                    return project.projectStatus === ProjectStatus.ACTIVE;
                }
                return project.projectStatus === ProjectStatus.FINISHED;
            });
            this.assignedProjects = relevantProjects;
            this.renderProjects();
        })
        this.attach();
        this.renderContent();
    }

    private renderProjects() {
        const listElement = document.getElementById(`${this.typeOfProject}-projects-list`)! as HTMLUListElement;
        listElement.innerHTML = '';
        for(const projectItem of this.assignedProjects) {
            const listItem = document.createElement('li');
            listItem.textContent = projectItem.title;
            listElement.appendChild(listItem)
        }
    }

    private renderContent() {
        const listId = `${this.typeOfProject}-projects-list`;
        this.sectionElement.querySelector('ul')!.id = listId;
        this.sectionElement.querySelector('h2')!.textContent = this.typeOfProject.toUpperCase() + ' PROJECTS';

    }

    private attach() {
        this.hostElement.insertAdjacentElement('beforeend', this.sectionElement);
    }
}



const projectInput = new ProjectInput();
const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');