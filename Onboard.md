# BCAN Dev Resource Page

## Technology Preface

<br>

**SatchelJS**: [Satchel Documentation](https://microsoft.github.io/satcheljs/book/)

   Satchel is the dataflow framework we use in this repository. It builds on top of the Flux architecture and uses **MobX** under the hood for reactive state management.

**NestJS**: [NestJS Documentation](https://docs.nestjs.com/)

   NestJS is our framework that helps to modularize service, model, controller, (and module) design in the backend. More info on designing a nest directory is in the **/backend/README.md.**

**AWS Services**: [DynamoDB Documentation](https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_GetItem.html)

   We use AWS services such as Cognito and DynamoDB for authentication and database operations respectively. Refer to online material surrounding the ecosystem or some other Nest modules we already have set up!

---
<br>

## Testing

<br>

**Frontend**: Vitest with React Testing Library
<br>
**Backend**: Vitest

    Both repositories use npm run test