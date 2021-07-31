/// <reference  path="../state/ProjectState.ts"/>
/// <reference  path="../util/Validation.ts"/>
/// <reference  path="../decorators/Autobind.ts"/>
/// <reference  path="BaseComponent.ts"/>

namespace DDApp{
    export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
        titleInputElement: HTMLInputElement;
        descriptionInputElement: HTMLInputElement;
        peopleInputElement: HTMLInputElement;

        constructor() {
            super('project-input', 'app', true, 'user-input');

            this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
            this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
            this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;

            this.configure();
        }

        renderContent(): void {
        }

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

            if (!validate(titleValidatable) ||
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
}