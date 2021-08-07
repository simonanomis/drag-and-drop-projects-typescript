import { ProjectInput } from './components/project-input';
import { ProjectList } from './components/project-list';
import _ from 'lodash';
import 'reflect-metadata';

new ProjectInput();
new ProjectList('active');
new ProjectList('finished');

console.log(_.shuffle([1, 3, 5]));