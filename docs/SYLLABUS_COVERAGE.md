# Syllabus coverage

Outline: *Awesome Low Level Design*. The source is used only as a syllabus; all PrepBuddy content is original.

`npm run validate:coverage` reads the table below:
- every row must have a subject id (several rows may share one subject, e.g. a topic listed in two chapters);
- every subject id must exist under `src/content/*/` unless the row status is `TODO`;
- `npm run validate:coverage -- --strict` also fails on any `TODO` row (used for the definition of done).

Status values: `TODO` (no subject yet), `PLACEHOLDER`, `DRAFT`, `DONE`.

Section ids match `sections` in `src/content/low-level-design/topic.json`.

## Coverage table

| # | Section | Syllabus item | Subject id | Status |
|---|---|---|---|---|
| 1.1 | introduction | What is Low-Level Design? | what-is-lld | DONE |
| 1.2 | introduction | LLD vs HLD | lld-vs-hld | DONE |
| 1.3 | introduction | Object-Oriented Design (OOD) | object-oriented-design | DONE |
| 1.4 | introduction | Role of LLD in software engineering | role-of-lld | DONE |
| 1.5 | introduction | Functional and non-functional requirements | functional-non-functional-requirements | DONE |
| 1.6 | introduction | Maintainability, extensibility and reusability | maintainability-extensibility-reusability | DONE |
| 1.7 | introduction | How to approach an LLD interview problem | approaching-lld-interviews | DONE |
| 2.1 | python-fundamentals | Classes and objects | classes-and-objects | DONE |
| 2.2 | python-fundamentals | Constructors and instance attributes | constructors-and-attributes | DONE |
| 2.3 | python-fundamentals | Instance, class and static methods | instance-class-static-methods | DONE |
| 2.4 | python-fundamentals | Encapsulation and access conventions | encapsulation | DONE |
| 2.5 | python-fundamentals | Inheritance and method overriding | inheritance-and-overriding | DONE |
| 2.6 | python-fundamentals | Polymorphism and duck typing | polymorphism-and-duck-typing | DONE |
| 2.7 | python-fundamentals | Abstraction and abstract base classes | abstraction-and-abcs | DONE |
| 2.8 | python-fundamentals | Interfaces and Protocols | interfaces-and-protocols | DONE |
| 2.9 | python-fundamentals | Composition and delegation | composition-and-delegation | DONE |
| 2.10 | python-fundamentals | Properties, enums and dataclasses | properties-enums-dataclasses | DONE |
| 2.11 | python-fundamentals | Exceptions and custom exceptions | exceptions | DONE |
| 2.12 | python-fundamentals | Type hints and generics | type-hints-and-generics | DONE |
| 3.1 | ood-fundamentals | The four pillars of OOP | four-pillars-of-oop | DONE |
| 3.2 | ood-fundamentals | Class responsibilities | class-responsibilities | DONE |
| 3.3 | ood-fundamentals | Identifying entities and value objects | entities-and-value-objects | DONE |
| 3.4 | ood-fundamentals | Object collaboration and message passing | object-collaboration | DONE |
| 3.5 | ood-fundamentals | Association | association | DONE |
| 3.6 | ood-fundamentals | Aggregation | aggregation | DONE |
| 3.7 | ood-fundamentals | Composition | composition | DONE |
| 3.8 | ood-fundamentals | Dependency | dependency-relationship | DONE |
| 3.9 | ood-fundamentals | Inheritance vs composition | composition-over-inheritance | DONE |
| 3.10 | ood-fundamentals | Coupling and cohesion | coupling-and-cohesion | DONE |
| 3.11 | ood-fundamentals | Dependency direction | dependency-direction | DONE |
| 3.12 | ood-fundamentals | Favor composition over inheritance | composition-over-inheritance | DONE |
| 4.1 | uml | UML overview | uml-overview | TODO |
| 4.2 | uml | Class diagrams | class-diagrams | TODO |
| 4.3 | uml | Class attributes, methods and visibility | uml-members-and-visibility | TODO |
| 4.4 | uml | Relationships and multiplicity | uml-relationships-and-multiplicity | TODO |
| 4.5 | uml | Interfaces and abstract classes in UML | uml-interfaces-and-abstract-classes | TODO |
| 4.6 | uml | Use-case diagrams | use-case-diagrams | TODO |
| 4.7 | uml | Sequence diagrams | sequence-diagrams | TODO |
| 4.8 | uml | Activity diagrams | activity-diagrams | TODO |
| 4.9 | uml | State-machine diagrams | state-machine-diagrams | TODO |
| 4.10 | uml | Translating requirements into class diagrams | requirements-to-class-diagrams | TODO |
| 5.1 | design-principles | DRY: Don't Repeat Yourself | dry | TODO |
| 5.2 | design-principles | KISS: Keep It Simple | kiss | TODO |
| 5.3 | design-principles | YAGNI: You Aren't Gonna Need It | yagni | TODO |
| 5.4 | design-principles | Separation of Concerns | separation-of-concerns | TODO |
| 5.5 | design-principles | Principle of Least Knowledge | least-knowledge | TODO |
| 5.6 | design-principles | Program to an interface | program-to-an-interface | TODO |
| 5.7 | design-principles | SOLID overview | solid-overview | TODO |
| 5.8 | design-principles | Single Responsibility Principle | single-responsibility | TODO |
| 5.9 | design-principles | Open/Closed Principle | open-closed | TODO |
| 5.10 | design-principles | Liskov Substitution Principle | liskov-substitution | TODO |
| 5.11 | design-principles | Interface Segregation Principle | interface-segregation | TODO |
| 5.12 | design-principles | Dependency Inversion Principle | dependency-inversion | TODO |
| 5.13 | design-principles | GRASP principles | grasp | TODO |
| 6.1 | creational-patterns | Why creational patterns? | why-creational-patterns | TODO |
| 6.2 | creational-patterns | Singleton | singleton | DONE |
| 6.3 | creational-patterns | Factory Method | factory-method | TODO |
| 6.4 | creational-patterns | Abstract Factory | abstract-factory | TODO |
| 6.5 | creational-patterns | Builder | builder | TODO |
| 6.6 | creational-patterns | Prototype | prototype | TODO |
| 6.7 | creational-patterns | Choosing the right creational pattern | choosing-creational-patterns | TODO |
| 7.1 | structural-patterns | Why structural patterns? | why-structural-patterns | TODO |
| 7.2 | structural-patterns | Adapter | adapter | TODO |
| 7.3 | structural-patterns | Bridge | bridge | TODO |
| 7.4 | structural-patterns | Composite | composite | TODO |
| 7.5 | structural-patterns | Decorator | decorator | TODO |
| 7.6 | structural-patterns | Facade | facade | TODO |
| 7.7 | structural-patterns | Flyweight | flyweight | TODO |
| 7.8 | structural-patterns | Proxy | proxy | TODO |
| 7.9 | structural-patterns | Choosing the right structural pattern | choosing-structural-patterns | TODO |
| 8.1 | behavioral-patterns | Why behavioral patterns? | why-behavioral-patterns | TODO |
| 8.2 | behavioral-patterns | Chain of Responsibility | chain-of-responsibility | TODO |
| 8.3 | behavioral-patterns | Command | command | TODO |
| 8.4 | behavioral-patterns | Iterator | iterator | TODO |
| 8.5 | behavioral-patterns | Mediator | mediator | TODO |
| 8.6 | behavioral-patterns | Memento | memento | TODO |
| 8.7 | behavioral-patterns | Observer | observer | DONE |
| 8.8 | behavioral-patterns | State | state | TODO |
| 8.9 | behavioral-patterns | Strategy | strategy | DONE |
| 8.10 | behavioral-patterns | Template Method | template-method | TODO |
| 8.11 | behavioral-patterns | Visitor | visitor | TODO |
| 8.12 | behavioral-patterns | Choosing the right behavioral pattern | choosing-behavioral-patterns | TODO |
| 9.1 | clean-code | Meaningful names | meaningful-names | TODO |
| 9.2 | clean-code | Small and focused classes | small-focused-classes | TODO |
| 9.3 | clean-code | Methods and function design | function-design | TODO |
| 9.4 | clean-code | Code smells | code-smells | TODO |
| 9.5 | clean-code | Long methods and large classes | long-methods-large-classes | TODO |
| 9.6 | clean-code | Duplicate logic | duplicate-logic | TODO |
| 9.7 | clean-code | Feature envy and inappropriate intimacy | feature-envy-inappropriate-intimacy | TODO |
| 9.8 | clean-code | Refactoring conditional logic | refactoring-conditionals | TODO |
| 9.9 | clean-code | Replacing conditionals with polymorphism | replace-conditional-with-polymorphism | TODO |
| 9.10 | clean-code | Refactoring toward SOLID | refactoring-toward-solid | TODO |
| 9.11 | clean-code | Avoiding overengineering | avoiding-overengineering | TODO |
| 10.1 | complete-solution | Gathering requirements | gathering-requirements | TODO |
| 10.2 | complete-solution | Clarifying scope and assumptions | clarifying-scope | TODO |
| 10.3 | complete-solution | Identifying actors and use cases | actors-and-use-cases | TODO |
| 10.4 | complete-solution | Defining entities and value objects | modeling-entities | TODO |
| 10.5 | complete-solution | Assigning class responsibilities | assigning-responsibilities | TODO |
| 10.6 | complete-solution | Defining interfaces and contracts | interfaces-and-contracts | TODO |
| 10.7 | complete-solution | Modeling relationships | modeling-relationships | TODO |
| 10.8 | complete-solution | Drawing the class diagram | drawing-the-class-diagram | TODO |
| 10.9 | complete-solution | Implementing the core workflow | implementing-core-workflow | TODO |
| 10.10 | complete-solution | Handling validation and errors | validation-and-errors | TODO |
| 10.11 | complete-solution | Handling edge cases | handling-edge-cases | TODO |
| 10.12 | complete-solution | Extending the design | extending-the-design | TODO |
| 10.13 | complete-solution | Testing and explaining trade-offs | testing-and-trade-offs | TODO |
| 11.1 | concurrency | Concurrency vs parallelism | concurrency-vs-parallelism | TODO |
| 11.2 | concurrency | Processes vs threads | processes-vs-threads | TODO |
| 11.3 | concurrency | Race conditions | race-conditions | TODO |
| 11.4 | concurrency | Critical sections | critical-sections | TODO |
| 11.5 | concurrency | Locks and mutexes | locks-and-mutexes | TODO |
| 11.6 | concurrency | Semaphores | semaphores | TODO |
| 11.7 | concurrency | Deadlocks and livelocks | deadlocks-and-livelocks | TODO |
| 11.8 | concurrency | Thread-safe singleton | singleton | DONE |
| 11.9 | concurrency | Atomicity and synchronization | atomicity-and-synchronization | TODO |
| 11.10 | concurrency | Producer-consumer pattern | producer-consumer | TODO |
| 11.11 | concurrency | Thread pools | thread-pools | TODO |
| 11.12 | concurrency | Concurrent access to shared resources | shared-resource-access | TODO |
| 12.1 | api-persistence | Separation of business logic and transport | business-logic-vs-transport | TODO |
| 12.2 | api-persistence | Controller, service and repository layers | layered-architecture | TODO |
| 12.3 | api-persistence | Repository pattern | repository-pattern | TODO |
| 12.4 | api-persistence | Dependency injection | dependency-injection | TODO |
| 12.5 | api-persistence | DTOs and domain models | dtos-and-domain-models | TODO |
| 12.6 | api-persistence | Input validation | input-validation | TODO |
| 12.7 | api-persistence | Error handling and response contracts | error-contracts | TODO |
| 12.8 | api-persistence | Entity relationships and database mapping | database-mapping | TODO |
| 12.9 | api-persistence | Transactions and consistency | transactions-and-consistency | TODO |
| 12.10 | api-persistence | Keeping persistence concerns out of domain logic | persistence-ignorance | TODO |
| 13.1 | testing | Unit testing classes | unit-testing-classes | TODO |
| 13.2 | testing | Testing interfaces and contracts | testing-interfaces-and-contracts | TODO |
| 13.3 | testing | Mocking dependencies | mocking | TODO |
| 13.4 | testing | Dependency injection for testability | dependency-injection | TODO |
| 13.5 | testing | Testing state transitions | testing-state-transitions | TODO |
| 13.6 | testing | Testing error cases | testing-error-cases | TODO |
| 13.7 | testing | Boundary and edge-case testing | boundary-testing | TODO |
| 13.8 | testing | Testing concurrent behavior | testing-concurrency | TODO |
| 13.9 | testing | Test-driven development basics | tdd-basics | TODO |
| 14.1 | problems-beginner | Design a Tic-Tac-Toe game | tic-tac-toe | TODO |
| 14.2 | problems-beginner | Design a Library Management System | library-management | TODO |
| 14.3 | problems-beginner | Design a Parking Lot | parking-lot | PLACEHOLDER |
| 14.4 | problems-beginner | Design a Vending Machine | vending-machine | TODO |
| 14.5 | problems-beginner | Design a Deck of Cards | deck-of-cards | TODO |
| 14.6 | problems-beginner | Design a Simple Logging Framework | logging-framework | TODO |
| 15.1 | problems-intermediate | Design an ATM | atm | TODO |
| 15.2 | problems-intermediate | Design an Elevator System | elevator-system | TODO |
| 15.3 | problems-intermediate | Design a Movie Ticket Booking System | movie-ticket-booking | TODO |
| 15.4 | problems-intermediate | Design a Splitwise-like expense-sharing system | expense-sharing | TODO |
| 15.5 | problems-intermediate | Design a Snake and Ladder game | snake-and-ladder | TODO |
| 15.6 | problems-intermediate | Design a Notification System | notification-system | TODO |
| 15.7 | problems-intermediate | Design a Shopping Cart and Checkout | shopping-cart-checkout | TODO |
| 16.1 | problems-advanced | Design a Chess Game | chess | TODO |
| 16.2 | problems-advanced | Design a Food Delivery System | food-delivery | TODO |
| 16.3 | problems-advanced | Design a Meeting Room Scheduler | meeting-room-scheduler | TODO |
| 16.4 | problems-advanced | Design an In-Memory Cache with LRU | lru-cache | TODO |
| 16.5 | problems-advanced | Design a Rate Limiter | rate-limiter | TODO |
| 16.6 | problems-advanced | Design a Pub/Sub Event Bus | pub-sub-event-bus | TODO |
| 16.7 | problems-advanced | Design a Task Scheduler | task-scheduler | TODO |
| 16.8 | problems-advanced | Design a File System | file-system | TODO |
| 17.1 | revision | Pattern selection cheat sheet | pattern-selection-cheat-sheet | TODO |
| 17.2 | revision | SOLID violation identification exercises | solid-violation-exercises | TODO |
| 17.3 | revision | UML revision guide | uml-revision | TODO |
| 17.4 | revision | Class-design exercises without solutions | class-design-exercises | TODO |
| 17.5 | revision | Common LLD interview questions | common-lld-questions | TODO |
| 17.6 | revision | Trade-off discussion practice | trade-off-practice | TODO |
| 17.7 | revision | Refactoring exercises | refactoring-exercises | TODO |
| 17.8 | revision | Mock interview checklist | mock-interview-checklist | TODO |
| 17.9 | revision | Final revision notes | final-revision-notes | TODO |
