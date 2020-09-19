import { Injectable } from '@nestjs/common';

import { People, Person } from '@roadtrip/api-interfaces';

@Injectable()
export class PeopleService {
  // Initialize to the given example:
  private idCounter = 3;
  private people: People = {
    0: { id: 0, name: 'Adriana' },
    1: { id: 1, name: 'Bao' },
    2: { id: 2, name: 'Camden' },
  };

  private getPerson(id: number): Person {
    if (isNaN(id)) {
      throw Error('Provided ID is not a number');
    }
    const person = this.people[id];
    if (!person) {
      throw Error(`Person ${id} not found`);
    }
    return person;
  }

  create(person: Person): Person {
    person.id = this.idCounter++;
    if (!person.name) {
      person.name = '';
    }
    this.people[person.id] = person;
    return person;
  }

  findAll(): People {
    return { ...this.people }; // Preserve immutability
  }

  findOne(id: number): Person {
    return this.getPerson(id);
  }

  remove(id: number): void {
    this.getPerson(id); // Throws if it can't be found
    delete this.people[id];
  }

  patch(id: number, personPatch: Person) {
    const person = this.getPerson(id);
    const personMerged: Person = {
      ...person,
      ...personPatch,
      id: id, // Disallow changing the ID
    };
    this.people[id] = personMerged;
    return personMerged;
  }
}
