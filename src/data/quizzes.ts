import { PatternQuiz } from "../types";

export const patternQuizzes: Record<string, PatternQuiz> = {
  singleton: {
    patternId: "singleton",
    questions: [
      {
        id: "s1",
        question: "What is the primary purpose of the Singleton pattern?",
        options: [
          "Ensure a class has only one instance and provide a global access point to it.",
          "Enable easy inheritance and subclassing of utility components.",
          "Hide object creation details behind a dynamic interface."
        ],
        correctAnswerIndex: 0,
        explanation: "The Singleton pattern restricts a class from being instantiated more than once, managing a single global instance that can be accessed uniformly throughout the application."
      },
      {
        id: "s2",
        question: "In a multithreaded environment, what is a critical hazard of a naive Singleton implementation?",
        options: [
          "Multiple threads might access the constructor simultaneously, creating multiple instances of the Singleton.",
          "It triggers a stack overflow exception on thread switching.",
          "Threads will be forced to execute sequentially, causing a dead lock."
        ],
        correctAnswerIndex: 0,
        explanation: "Without proper synchronization (like double-checked locking) or eager initialization, concurrent threads might evaluate the 'instance is null' condition simultaneously, violating the single-instance constraint."
      },
      {
        id: "s3",
        question: "Why is the Singleton pattern frequently considered an anti-pattern in modern software engineering?",
        options: [
          "It introduces global state, which tightly couples components and makes unit testing extremely difficult.",
          "It consumes too much system CPU by polling active references.",
          "It prevents the developer from defining public methods."
        ],
        correctAnswerIndex: 0,
        explanation: "Global state hides dependencies inside classes and makes mocking/stubbing difficult during tests, leading to side effects across test suites."
      }
    ]
  },
  "factory-method": {
    patternId: "factory-method",
    questions: [
      {
        id: "f1",
        question: "What does the Factory Method pattern delegate to subclasses?",
        options: [
          "The decision of which concrete class to instantiate.",
          "The concrete step-by-step algorithms of object construction.",
          "The responsibility of deallocating unused garbage."
        ],
        correctAnswerIndex: 0,
        explanation: "The Factory Method defines an interface/method for creating objects, but lets subclasses override it to choose which concrete product class gets created."
      },
      {
        id: "f2",
        question: "Which SOLID principle does the Factory Method pattern heavily support by allowing new product types without altering existing creator code?",
        options: [
          "The Open/Closed Principle (OCP)",
          "The Single Responsibility Principle (SRP)",
          "The Liskov Substitution Principle (LSP)"
        ],
        correctAnswerIndex: 0,
        explanation: "By extending creators and products instead of modifying original code, you can introduce new product variations without breaking existing business logic."
      },
      {
        id: "f3",
        question: "When should you prefer Factory Method over a standard constructor?",
        options: [
          "When you do not know the exact types and dependencies of the objects your code should work with.",
          "When you want to construct objects piece-by-piece using complex configurations.",
          "When there is only one concrete class that will ever be instantiated."
        ],
        correctAnswerIndex: 0,
        explanation: "Factory Method decouples product implementation from product usage, making it ideal when you need to support dynamic or extensible suites of product classes."
      }
    ]
  },
  builder: {
    patternId: "builder",
    questions: [
      {
        id: "b1",
        question: "What is the primary problem solved by the Builder pattern?",
        options: [
          "Constructing complex objects step-by-step to avoid 'telescoping' constructors with too many parameters.",
          "Enabling class-level multiple inheritance in single-inheritance languages.",
          "Restricting clients from instantiating products without direct network connection."
        ],
        correctAnswerIndex: 0,
        explanation: "Telescoping constructors (constructors with many optional parameters) are hard to read and write. Builder lets you chain readable step-by-step configuration method calls."
      },
      {
        id: "b2",
        question: "What is the role of the optional 'Director' class in the Builder pattern?",
        options: [
          "It defines the order/steps in which the build steps should be executed.",
          "It deallocates constructed objects once they go out of scope.",
          "It acts as a visual template rendering engine."
        ],
        correctAnswerIndex: 0,
        explanation: "The Director class orchestrates the builder methods to construct specific variations of the product (e.g. 'buildSportsCar' or 'buildSUV'), so clients don't have to specify all steps every time."
      },
      {
        id: "b3",
        question: "How does the Builder pattern differ from the Factory Method pattern?",
        options: [
          "Builder builds complex objects step-by-step; Factory Method creates products in a single call.",
          "Builder does not support interface definitions.",
          "Builder can only create singletons."
        ],
        correctAnswerIndex: 0,
        explanation: "While both are creational patterns, Factory Method focus on single-call creation of polymorphic products, while Builder focuses on the gradual, custom construction of complex nested configurations."
      }
    ]
  },
  adapter: {
    patternId: "adapter",
    questions: [
      {
        id: "a1",
        question: "What is the main objective of the Adapter pattern?",
        options: [
          "To allow objects with incompatible interfaces to work together by translating calls.",
          "To dynamically attach new responsibilities to an object at runtime.",
          "To serialize objects into structured JSON strings."
        ],
        correctAnswerIndex: 0,
        explanation: "An Adapter acts as a wrapper/translator between two incompatible interfaces, letting them collaborate seamlessly without changing either side's source code."
      },
      {
        id: "a2",
        question: "What is the difference between Class Adapter and Object Adapter?",
        options: [
          "Class Adapter uses multiple inheritance; Object Adapter uses composition and delegation.",
          "Class Adapter is faster; Object Adapter consumes less RAM.",
          "Class Adapter is for UI; Object Adapter is for database layers."
        ],
        correctAnswerIndex: 0,
        explanation: "Class Adapter inherits interfaces of both the target and the adaptee (requiring multiple inheritance support), whereas Object Adapter holds a reference to the adaptee (composition) and delegates calls to it."
      },
      {
        id: "a3",
        question: "When an Adapter wraps an existing object, what is the wrapped object commonly called?",
        options: [
          "The Adaptee",
          "The Target",
          "The Prototype"
        ],
        correctAnswerIndex: 0,
        explanation: "The Adaptee is the existing class with the incompatible interface that needs translation. The Adapter wraps it, converting calls to the Target interface."
      }
    ]
  },
  decorator: {
    patternId: "decorator",
    questions: [
      {
        id: "d1",
        question: "How does the Decorator pattern add behaviors to an object compared to standard class inheritance?",
        options: [
          "Dynamically via object composition/wrapping at runtime.",
          "Statically at compile-time.",
          "By modifying the source class directly."
        ],
        correctAnswerIndex: 0,
        explanation: "Inheritance adds behavior statically at compile-time to the entire class. Decorator wraps individual objects dynamically at runtime, allowing combinations of behaviors."
      },
      {
        id: "d2",
        question: "What relationship must a Decorator class have with the component it decorates?",
        options: [
          "It must implement the same interface as the wrapped component.",
          "It must inherit directly from the singleton instance.",
          "It must keep its methods completely isolated from the component."
        ],
        correctAnswerIndex: 0,
        explanation: "To keep the wrapper transparent to clients, decorators must conform to the same interface as the objects they wrap, allowing nested wraps."
      },
      {
        id: "d3",
        question: "Which of the following is a classic example of the Decorator pattern in standard platform APIs?",
        options: [
          "Input/Output Streams (e.g., BufferedReader wrapping FileReader in Java).",
          "Global Math functions (e.g., Math.max).",
          "Simple sequential array lists."
        ],
        correctAnswerIndex: 0,
        explanation: "In I/O libraries, base streams read raw bytes, while decorators wrap them to add buffering, compression, or line-reading helper capabilities."
      }
    ]
  },
  facade: {
    patternId: "facade",
    questions: [
      {
        id: "fa1",
        question: "What is the primary purpose of the Facade design pattern?",
        options: [
          "To provide a simplified, high-level interface to a complex subsystem or set of classes.",
          "To guarantee there is only one instance of the subsystem.",
          "To encrypt communications between subsystems."
        ],
        correctAnswerIndex: 0,
        explanation: "A Facade offers a simple entry-point with basic controls, masking the underlying complexity of initializing, connecting, and executing multiple subsystem objects."
      },
      {
        id: "fa2",
        question: "Does a Facade prevent clients from accessing the underlying subsystem classes directly?",
        options: [
          "No, clients can still access subsystem classes directly if they require fine-grained control.",
          "Yes, it uses private access modifiers to strictly block all subsystem classes.",
          "Yes, because it compiles the subsystem into a different binary format."
        ],
        correctAnswerIndex: 0,
        explanation: "A Facade is a convenience layer, not a strict security firewall. Subsystem classes remain fully available for clients needing direct, advanced manipulation."
      },
      {
        id: "fa3",
        question: "In which scenario is a Facade best suited?",
        options: [
          "When you need to integrate or simplify interaction with a complex multi-step library or legacy API.",
          "When you need step-by-step custom object construction.",
          "When you want to establish a real-time event-driven subscription model."
        ],
        correctAnswerIndex: 0,
        explanation: "If you have a library with complex steps, dependencies, and configuration, a Facade simplifies day-to-day operations with a single, clear method."
      }
    ]
  },
  observer: {
    patternId: "observer",
    questions: [
      {
        id: "o1",
        question: "What type of relationship does the Observer pattern establish between objects?",
        options: [
          "A one-to-many subscription model where state changes notify dependents.",
          "A strict hierarchical class inheritance structure.",
          "A bidirectional database sync constraint."
        ],
        correctAnswerIndex: 0,
        explanation: "The Observer pattern establishes a dynamic system where one object (the Subject) publishes updates and multiple registered listeners (Observers) react accordingly."
      },
      {
        id: "o2",
        question: "What are the two primary roles in the Observer pattern?",
        options: [
          "Subject (Publisher) and Observers (Subscribers).",
          "Creator and Product.",
          "Context and State."
        ],
        correctAnswerIndex: 0,
        explanation: "The Subject holds the state and manages the list of registered Observers, invoking their update methods whenever state changes."
      },
      {
        id: "o3",
        question: "What is a major potential issue of the Observer pattern if subscribers fail to unsubscribe when discarded?",
        options: [
          "Memory leaks, commonly known as the 'lapsed listener' leak.",
          "Circular deadlock blockages.",
          "Corrupted files on disk."
        ],
        correctAnswerIndex: 0,
        explanation: "If subscribers aren't unregistered, the publisher retains strong references to them in its list, preventing garbage collection and leading to memory leaks."
      }
    ]
  },
  strategy: {
    patternId: "strategy",
    questions: [
      {
        id: "st1",
        question: "What does the Strategy pattern let you do with a family of algorithms?",
        options: [
          "Put each algorithm into a separate class and make their instances interchangeable at runtime.",
          "Combine them into a single massive switch statement for execution.",
          "Execute them sequentially using multi-threaded processes."
        ],
        correctAnswerIndex: 0,
        explanation: "Strategy decouples the algorithm implementation from the host class, allowing clients or context to switch algorithms dynamically at runtime."
      },
      {
        id: "st2",
        question: "How does the Context class communicate with the active Strategy object?",
        options: [
          "By calling standard methods defined in the shared Strategy interface.",
          "By directly editing the Strategy's private fields.",
          "By sending global operating system signals."
        ],
        correctAnswerIndex: 0,
        explanation: "The Context is designed to work with any strategy that implements the Strategy interface, calling its signature method without knowing concrete details."
      },
      {
        id: "st3",
        question: "When is the Strategy pattern highly recommended?",
        options: [
          "When you have multiple variations of an algorithm and want to avoid massive conditional statements.",
          "When you want to restrict object creation to exactly one active instance.",
          "When you need to keep a rollback history of previous states."
        ],
        correctAnswerIndex: 0,
        explanation: "Instead of dozens of if-else or switch cases checking config flags to run different code, Strategy isolates each algorithm in its own clean class."
      }
    ]
  },
  state: {
    patternId: "state",
    questions: [
      {
        id: "stt1",
        question: "What is the core intent of the State design pattern?",
        options: [
          "Allow an object to alter its behavior when its internal state changes, appearing as if its class changed.",
          "Hold application-wide environment variables in memory.",
          "Cache database query responses."
        ],
        correctAnswerIndex: 0,
        explanation: "The State pattern encapsulates state-specific behaviors inside distinct State classes, delegating operations to the active state object."
      },
      {
        id: "stt2",
        question: "In the State pattern, who is typically responsible for triggering transitions between states?",
        options: [
          "Either the Context class or the concrete State classes themselves.",
          "The client application exclusively.",
          "An external cron scheduler daemon."
        ],
        correctAnswerIndex: 0,
        explanation: "State transitions can be managed by the Context (for static transitions) or by the individual State classes (for dynamic, sequential transitions)."
      },
      {
        id: "stt3",
        question: "How is the State pattern structurally similar to Strategy, but conceptually different in intent?",
        options: [
          "Both use composition, but States are highly aware of each other and drive transitions; Strategies are independent.",
          "State is a creational pattern, whereas Strategy is structural.",
          "State is exclusively for user interfaces, while Strategy is for utility calculations."
        ],
        correctAnswerIndex: 0,
        explanation: "While both delegate work to encapsulated classes, Strategies are generally unaware of each other and rarely switch themselves. States actively manage and orchestrate the transition from one state class to another."
      }
    ]
  }
};
