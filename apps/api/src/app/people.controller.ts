import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { Person, People } from '@roadtrip/api-interfaces';

import { PeopleService } from './people.service';

@Controller('people')
export class PeopleController {
  constructor(private peopleService: PeopleService) {}

  @Post()
  create(@Body() person: Person): Person {
    return this.peopleService.create(person);
  }

  @Get()
  findAll(): People {
    return this.peopleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Person {
    return this.peopleService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string): void {
    this.peopleService.remove(+id);
  }

  @Patch(':id')
  patch(@Param('id') id: string, @Body() person: Person) {
    return this.peopleService.patch(+id, person);
  }
}
