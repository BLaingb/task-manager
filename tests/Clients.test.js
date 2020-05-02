const fs = require("fs");
const path = require("path");
const EasyGraphQLTester = require("easygraphql-tester");

const schemaCode = fs.readFileSync(path.join(__dirname, '../src', 'schema.graphql'), 'utf8');

describe("ClientsQuery Tests", () => {
  let tester;
  beforeEach(() => {
    tester = new EasyGraphQLTester(schemaCode);
  });

  describe("Queries to get all the clients", () => {
    it("notValidField is invalid on client query", () => {
      let query = `
        query {
          clients {
            notValidField
          }
        }
      `;

      // First arg: false, there is no field notValidField
      // Second arg: query to test
      tester.test(false, query);
    });

    it("valid query with all fields needed for all the clients", () => {
      let query = `
        query {
          clients {
            id
						firstName
						lastNamePaternal
						lastNameMaternal
						birthDate
						rfc
						address{
							street
							number
							neighborhood
							delegation
							city
							state
							zipcode
							type
							years
						}
						commercialExecutive
						workPhone
						cellphone
						email
						civilStatus
						scholarship
						housingCondition
						economicDependants
						spousalRegime
						accreditedRole
						driverFullName
						driverPhone
						ownerFullName
						ownerPhone
						references{
							fullName
							phone
							relationship
							yearsKnown
							availableTime
						}
						createdAt
          }
        }
      `;

      // First arg: true, all fields should be valid
      // Second arg: query to test
      tester.test(true, query);
    });
  });

  describe("Queries to get a specific client", () => {
    it("notValidField is invalid on client query", () => {
      let query = `
        query {
          client(id: "1LUfeHhMT5QdTHVCF0ye") {
						id
            notValidField
          }
        }
      `;

      // First arg: false, there is no field notValidField
      // Second arg: query to test
      tester.test(false, query);
    });

    it("valid query with all fields needed for specific client", () => {
      let query = `
        query {
          client(id: "1LUfeHhMT5QdTHVCF0ye") {
            id
						firstName
						lastNamePaternal
						lastNameMaternal
						birthDate
          }
        }
      `;

      // First arg: true, all fields should be valid
      // Second arg: query to test
      tester.test(true, query);
    });
  });

});


describe("ClientsMutation Tests", () => {
  let tester;
  beforeEach(() => {
    tester = new EasyGraphQLTester(schemaCode);
  });

  describe("Mutation to create a client", () => {
    it("notValidField is invalid on ClientInput", () => {
      let mutation = `
        mutation {
          createClient(input: {
            notValidField: "No es válido"
          }) {
            success
            message
            id
          }
        }
      `;

      tester.test(false, mutation);
    });
  });

  describe("Mutation to create a client", () => {
    it("All valid fields on ClientInput", () => {
      let mutation = `
        mutation {
          createClient(input: {
            firstName: "Huitznahuitzna",
            lastNamePaternal: "Bolaños",
            lastNameMaternal: "Mejía",
            birthDate: "1993-11-12",
            rfc: "HUITZ812321",
            address: {
              street: "Epigmenio Gonzales",
              number: "99",
              neighborhood: "Las Palomas",
              delegation: null,
              city: "Queretaro",
              state: "Queretaro",
              zipcode: "76560",
              type: CASA,
              years: 6
            },
            commercialExecutive: "1",
            workPhone: "7227332882",
            cellphone: "4424435274",
            email: "huitz@gmail.com",
            civilStatus: SOLTERO,
            scholarship: UNIVERSIDAD,
            housingCondition: RENTADO,
            economicDependants: 10,
            spousalRegime: null,
            accreditedRole: CHOFER,
            driverFullName: "Huitz",
            driverPhone: "4424435274",
            ownerFullName: "Francisco Palacios A",
            ownerPhone: "7222013985",
          }) {
            success
            message
            id
          }
        }
      `;

      tester.test(true, mutation);
    });
  });

  describe("Mutation to update a client", () => {
    it("No id given to update", () => {
      let mutation = `
        mutation {
          updateClient(input: {
            firstName: "Huitznahuitzna",
            lastNamePaternal: "Bolaños",
            lastNameMaternal: "Mejía",
            birthDate: "1993-11-12",
            rfc: "HUITZ812321",
            address: {
              street: "Epigmenio Gonzales",
              number: "99",
              neighborhood: "Las Palomas",
              delegation: null,
              city: "Queretaro",
              state: "Queretaro",
              zipcode: "76560",
              type: CASA,
              years: 6
            },
            commercialExecutive: "1",
            workPhone: "7227332882",
            cellphone: "4424435274",
            email: "huitz@gmail.com",
            civilStatus: SOLTERO,
            scholarship: UNIVERSIDAD,
            housingCondition: RENTADO,
            economicDependants: 10,
            spousalRegime: null,
            accreditedRole: CHOFER,
            driverFullName: "Huitz",
            driverPhone: "4424435274",
            ownerFullName: "Francisco Palacios A",
            ownerPhone: "7222013985",
          }) {
            success
            message
            id
          }
        }
      `;

      tester.test(true, mutation);
    });
  });


 
});
