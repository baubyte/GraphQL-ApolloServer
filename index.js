
import { ApolloServer, gql, UserInputError } from "apollo-server";
import { v4 as uuid } from 'uuid';
const persons = [
  {
    id: "3d5fdfaf-2d6a-4f5d-9c4e-5b1c1f3a1e3e",
    name: "Arto Hellas",
    phone: "040-123456",
    street: "Tapiolankatu 5 A",
    city: "Espoo",
  },
  {
    id: "41e6b0c2-8f4e-4d3a-9c3e-2b2c2f4a5b6c",
    name: "Matti Luukkainen",
    street: "Mannerheimintie 20",
    city: "Helsinki",
  },
  {
    id: "5a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d",
    name: "Venla Ruuska",
    phone: "050-123456",
    street: "Nallemäentie 22 C",
    city: "Helsinki",
  },
  {
    id: "6f7e8d9c-0b1a-2c3d-4e5f-6a7b8c9d0e1f",
    name: "John Doe",
    street: "Unknown Street 1",
    city: "Unknown City",
  },
  {
    id: "7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d",
    name: "Jane Smith",
    phone: "040-987654",
    street: "Elm Street 5",
    city: "Helsinki",
  }
];

const typeDefs = gql`
  enum YesNo {
    YES
    NO
  }
  type Address {
    street: String!
    city: String!
  }
  type Person {
    id: ID!
    name: String!
    phone: String
    street: String!
    city: String!
    address: Address!
    fullAddress: String!
  }
  type Query {
    personCount: Int!
    allPersons(phone: YesNo ): [Person!]!
    findPersonById(id: ID!): Person
    findPersonByName(name: String!): Person
  }
  type Mutation {
    addPerson(
      name: String!
      phone: String
      street: String!
      city: String!
    ): Person
    editNumber(name: String!, phone: String!): Person
    deletePerson(id: ID!): Person
  }
`;

const resolvers = {
  Query: {
    personCount: () => persons.length,
    allPersons: (root, args) => {
        if (!args.phone) {
            return persons;
        }
        const byPhone = persons => args.phone === 'YES' ? Boolean(persons.phone) : !Boolean(persons.phone);
        return persons.filter(byPhone);
    },
    findPersonById: (root, args) => persons.find((person) => person.id === args.id),
    findPersonByName: (root, args) => persons.find((person) => person.name === args.name)
  },
  Mutation: {
    addPerson: (root, args) => {
        if (persons.find(p => p.name === args.name)) {
            throw new UserInputError("Name must be unique", { invalidArgs: args.name });
        }
        const person = { id: uuid(), ...args };
        persons.push(person);
        return person;
    },
    editNumber: (root, args) => {
        const person = persons.find(p => p.name === args.name);
        if (!person) {
            throw new UserInputError("Person not found", { invalidArgs: args.name });
        }
        const updatedPerson = { ...person, phone: args.phone };
        persons.splice(persons.indexOf(person), 1, updatedPerson);
        return updatedPerson;
    },
    deletePerson: (root, args) => {
        const personIndex = persons.findIndex(p => p.id === args.id);
        if (personIndex === -1) {
            throw new UserInputError("Person not found", { invalidArgs: args.id });
        }
        const deletedPerson = persons[personIndex];
        persons.splice(personIndex, 1);
        return deletedPerson;
    }
  },
  Person: {
    address: (root) => {
      return {
        street: root.street,
        city: root.city,
      };
    },
    fullAddress: (root) => {
      return `${root.street}, ${root.city}`;
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});