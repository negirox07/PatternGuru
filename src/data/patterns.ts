import { DesignPattern } from "../types";

export const designPatterns: DesignPattern[] = [
  {
    id: "singleton",
    title: "Singleton",
    category: "creational",
    difficulty: "Beginner",
    tagline: "Ensure a class has only one instance, while providing a global access point to this instance.",
    intent: "Singleton is a creational design pattern that lets you ensure that a class has only one instance, while providing a global access point to this instance.",
    problem: "The Singleton pattern solves two problems at the same time (violating the Single Responsibility Principle):\n1. Ensure that a class has just a single instance (common for shared resources like database connections or configuration managers).\n2. Provide a global access point to that instance.",
    solution: "All implementations of the Singleton have these two steps in common:\n1. Make the default constructor private, to prevent other objects from using the `new` operator with the Singleton class.\n2. Create a static creation method that acts as a constructor. Under the hood, this method calls the private constructor to create an object and saves it in a static field. All following calls to this method return the cached object.",
    analogy: "The government is an excellent real-world analogy. A country can have only one official government. Regardless of the personal identities of the individuals who form the government, the title, 'The Government of X', is a global point of access that identifies the group of people in charge.",
    diagram: `┌────────────────────────────────────────┐
│               Singleton                │
├────────────────────────────────────────┤
│ - instance: Singleton                  │
├────────────────────────────────────────┤
│ - Singleton()                          │
│ + getInstance(): Singleton             │
└────────────────────────────────────────┘`,
    pros: [
      "You can be sure that a class has only a single instance.",
      "You gain a global access point to that instance.",
      "The singleton object is initialized only when it's requested for the first time (lazy initialization)."
    ],
    cons: [
      "Violates the Single Responsibility Principle.",
      "Can mask bad design, for instance, when the components of the program know too much about each other.",
      "The pattern requires special treatment in a multithreaded environment so that multiple threads won't create a singleton object several times.",
      "It may be difficult to unit test the client code of the Singleton because many test frameworks rely on inheritance when producing mock objects."
    ],
    snippets: [
      {
        language: "typescript",
        code: `class DatabaseConnection {
  private static instance: DatabaseConnection | null = null;

  // Private constructor prevents instantiation outside this class
  private constructor() {
    console.log("Establishing secure database connection...");
  }

  // Static method to get the single instance
  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public query(sql: string): void {
    console.log(\`Executing query: \${sql}\`);
  }
}

// Usage:
const db1 = DatabaseConnection.getInstance();
const db2 = DatabaseConnection.getInstance();

console.log(db1 === db2); // true (Both refer to the exact same instance)
db1.query("SELECT * FROM users");`
      },
      {
        language: "python",
        code: `class DatabaseConnection:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super().__new__(cls, *args, **kwargs)
            # Initialize connection once
            print("Establishing secure database connection...")
        return cls._instance

    def query(self, sql: str):
        print(f"Executing query: {sql}")

# Usage:
db1 = DatabaseConnection()
db2 = DatabaseConnection()

print(db1 is db2) # True (Both refer to the exact same instance)
db1.query("SELECT * FROM users")`
      },
      {
        language: "java",
        code: `public final class DatabaseConnection {
    private static volatile DatabaseConnection instance;

    // Private constructor prevents instantiation
    private DatabaseConnection() {
        System.out.println("Establishing secure database connection...");
    }

    // Thread-safe double-checked locking Singleton
    public static DatabaseConnection getInstance() {
        DatabaseConnection result = instance;
        if (result != null) {
            return result;
        }
        synchronized(DatabaseConnection.class) {
            if (instance == null) {
                instance = new DatabaseConnection();
            }
            return instance;
        }
    }

    public void query(String sql) {
        System.out.println("Executing query: " + sql);
    }
}`
      },
      {
        language: "cpp",
        code: `#include <iostream>
#include <mutex>

class DatabaseConnection {
private:
    static DatabaseConnection* instance;
    static std::mutex mutex;

    // Private constructor
    DatabaseConnection() {
        std::cout << "Establishing secure database connection...\\n";
    }

public:
    // Delete copy constructor and assignment operator
    DatabaseConnection(const DatabaseConnection&) = delete;
    void operator=(const DatabaseConnection&) = delete;

    // Thread-safe static getter
    static DatabaseConnection* getInstance() {
        std::lock_guard<std::mutex> lock(mutex);
        if (instance == nullptr) {
            instance = new DatabaseConnection();
        }
        return instance;
    }

    void query(const std::string& sql) {
        std::cout << "Executing query: " << sql << "\\n";
    }
};

// Initialize static members
DatabaseConnection* DatabaseConnection::instance = nullptr;
std::mutex DatabaseConnection::mutex;`
      },
      {
        language: "csharp",
        code: `using System;

public sealed class DatabaseConnection {
    private static readonly Lazy<DatabaseConnection> lazyInstance =
        new Lazy<DatabaseConnection>(() => new DatabaseConnection());

    // Private constructor prevents instantiation
    private DatabaseConnection() {
        Console.WriteLine("Establishing secure database connection...");
    }

    // Thread-safe Lazy Singleton instance accessor
    public static DatabaseConnection Instance => lazyInstance.Value;

    public void Query(string sql) {
        Console.WriteLine($"Executing query: {sql}");
    }
}

// Usage:
// DatabaseConnection db1 = DatabaseConnection.Instance;
// db1.Query("SELECT * FROM users");`
      }
    ],
    relatedPatterns: ["factory-method", "facade"]
  },
  {
    id: "factory-method",
    title: "Factory Method",
    category: "creational",
    difficulty: "Intermediate",
    tagline: "Provide an interface for creating objects in a superclass, but allow subclasses to alter the type of objects that will be created.",
    intent: "Factory Method is a creational design pattern that provides an interface for creating objects in a superclass, but allows subclasses to alter the type of objects that will be created.",
    problem: "Imagine you're building a logistics management application. The first version of your app can only handle transportation by trucks, so the bulk of your code lives inside the `Truck` class. After some time, your app becomes popular, and you need to incorporate maritime transportation with ships. Adding a new class requires changing the entire codebase, making it highly dependent on specific classes.",
    solution: "The Factory Method pattern suggests that you replace direct object construction calls (using the `new` operator) with calls to a special factory method. Don't worry: the objects are still created via the `new` operator, but it's being called from within the factory method. Objects returned by a factory method are often referred to as products.",
    analogy: "A postal delivery company uses different transportation systems. A regular mail carrier delivers envelopes on foot or by bicycle. An express courier delivers packages via trucks. In both cases, the delivery operation is requested, but the concrete execution (foot, bike, truck) is decided dynamically by the transport department.",
    diagram: `┌─────────────────────────────┐
│           Creator           │
├─────────────────────────────┤
│ + someOperation()           │
│ + createTransport(): Product│◄───┐
└──────────────┬──────────────┘    │
               ▲                   │ Subclasses override
               │ inherits          │ factory method
┌──────────────┴──────────────┐    │
│         TruckCreator        │    │
├─────────────────────────────┤    │
│ + createTransport(): Truck  ├────┘
└─────────────────────────────┘`,
    pros: [
      "You avoid tight coupling between the creator and the concrete products.",
      "Single Responsibility Principle. You can move the product creation code into one place in the program, making the code easier to support.",
      "Open/Closed Principle. You can introduce new types of products into the program without breaking existing client code."
    ],
    cons: [
      "The code may become more complicated since you need to introduce a lot of new subclasses to implement the pattern. The best-case scenario is when you're introducing the pattern into an existing hierarchy of creator classes."
    ],
    snippets: [
      {
        language: "typescript",
        code: `// Common product interface
interface Transport {
  deliver(): void;
}

class Truck implements Transport {
  deliver(): void {
    console.log("Delivering by land in a sturdy cargo truck.");
  }
}

class Ship implements Transport {
  deliver(): void {
    console.log("Delivering by sea in a container vessel.");
  }
}

// Creator base class with Factory Method
abstract class Logistics {
  // The Factory Method
  public abstract createTransport(): Transport;

  public planDelivery(): void {
    const transport = this.createTransport();
    console.log("Logistics: Planning delivery route...");
    transport.deliver();
  }
}

// Concrete Creators override the factory method
class RoadLogistics extends Logistics {
  public createTransport(): Transport {
    return new Truck();
  }
}

class SeaLogistics extends Logistics {
  public createTransport(): Transport {
    return new Ship();
  }
}

// Usage:
const road = new RoadLogistics();
road.planDelivery(); // Delivers by land

const sea = new SeaLogistics();
sea.planDelivery();  // Delivers by sea`
      },
      {
        language: "python",
        code: `from abc import ABC, abstractmethod

# Product Interface
class Transport(ABC):
    @abstractmethod
    def deliver(self) -> None:
        pass

# Concrete Products
class Truck(Transport):
    def deliver(self) -> None:
        print("Delivering by land in a sturdy cargo truck.")

class Ship(Transport):
    def deliver(self) -> None:
        print("Delivering by sea in a container vessel.")

# Creator (Base Class)
class Logistics(ABC):
    @abstractmethod
    def create_transport(self) -> Transport:
        pass

    def plan_delivery(self) -> None:
        transport = self.create_transport()
        print("Logistics: Planning delivery route...")
        transport.deliver()

# Concrete Creators
class RoadLogistics(Logistics):
    def create_transport(self) -> Transport:
        return Truck()

class SeaLogistics(Logistics):
    def create_transport(self) -> Transport:
        return Ship()

# Usage:
road_delivery = RoadLogistics()
road_delivery.plan_delivery()`
      },
      {
        language: "java",
        code: `// Product Interface
interface Transport {
    void deliver();
}

// Concrete Products
class Truck implements Transport {
    public void deliver() {
        System.out.println("Delivering by land in a sturdy cargo truck.");
    }
}

class Ship implements Transport {
    public void deliver() {
        System.out.println("Delivering by sea in a container vessel.");
    }
}

// Creator Abstract Class
abstract class Logistics {
    public abstract Transport createTransport();

    public void planDelivery() {
        Transport transport = createTransport();
        System.out.println("Logistics: Planning delivery...");
        transport.deliver();
    }
}

// Concrete Creators
class RoadLogistics extends Logistics {
    public Transport createTransport() {
        return new Truck();
    }
}

class SeaLogistics extends Logistics {
    public Transport createTransport() {
        return new Ship();
    }
}`
      },
      {
        language: "cpp",
        code: `#include <iostream>
#include <memory>

// Product Interface
class Transport {
public:
    virtual ~Transport() {}
    virtual void deliver() = 0;
};

// Concrete Products
class Truck : public Transport {
public:
    void deliver() override {
        std::cout << "Delivering by land in a sturdy cargo truck.\\n";
    }
};

class Ship : public Transport {
public:
    void deliver() override {
        std::cout << "Delivering by sea in a container vessel.\\n";
    }
};

// Creator Abstract Class
class Logistics {
public:
    virtual ~Logistics() {}
    virtual std::unique_ptr<Transport> createTransport() = 0;

    void planDelivery() {
        auto transport = createTransport();
        std::cout << "Logistics: Planning delivery...\\n";
        transport->deliver();
    }
};

// Concrete Creators
class RoadLogistics : public Logistics {
public:
    std::unique_ptr<Transport> createTransport() override {
        return std::make_unique<Truck>();
    }
};`
      },
      {
        language: "csharp",
        code: `using System;

// Common Product Interface
public interface ITransport {
    void Deliver();
}

// Concrete Products
public class Truck : ITransport {
    public void Deliver() {
        Console.WriteLine("Delivering by land in a sturdy cargo truck.");
    }
}

public class Ship : ITransport {
    public void Deliver() {
        Console.WriteLine("Delivering by sea in a container vessel.");
    }
}

// Creator Abstract Class
public abstract class Logistics {
    public abstract ITransport CreateTransport();

    public void PlanDelivery() {
        ITransport transport = CreateTransport();
        Console.WriteLine("Logistics: Planning delivery...");
        transport.Deliver();
    }
}

// Concrete Creators
public class RoadLogistics : Logistics {
    public override ITransport CreateTransport() {
        return new Truck();
    }
}

public class SeaLogistics : Logistics {
    public override ITransport CreateTransport() {
        return new Ship();
    }
}`
      }
    ],
    relatedPatterns: ["singleton", "abstract-factory"]
  },
  {
    id: "builder",
    title: "Builder",
    category: "creational",
    difficulty: "Intermediate",
    tagline: "Construct complex objects step-by-step. Produce different types and representations of an object using the same construction code.",
    intent: "Builder is a creational design pattern that lets you construct complex objects step-by-step. The pattern allows you to produce different types and representations of an object using the same construction code.",
    problem: "Imagine a complex object that requires laborious, step-by-step initialization of many fields and nested objects. Such initialization code is usually buried inside a monstrous constructor with dozens of parameters. Or even worse: scattered all over the client code.",
    solution: "The Builder pattern extracts the object construction code out of its own class and moves it to separate objects called builders. The pattern organizes object construction into a set of steps. To create an object, you execute a series of these steps on a builder object.",
    analogy: "When you go to a fast-food counter, the standard order process is a Builder pattern. You order a burger, then you specify options: 'double cheese?' (step 1), 'add bacon?' (step 2), 'extra pickles?' (step 3). At the end, the server constructs and delivers your custom burger based on your specific configuration steps.",
    diagram: `┌────────────────────────────────────────┐
│              HouseBuilder              │
├────────────────────────────────────────┤
│ + buildWalls()                         │
│ + buildRoof()                          │
│ + buildDoors()                         │
│ + getResult(): House                   │
└────────────────────────────────────────┘`,
    pros: [
      "You can construct objects step-by-step, defer construction steps or run steps recursively.",
      "You can reuse the same construction code when building various representations of products.",
      "Single Responsibility Principle. You can isolate complex construction code from the business logic of the product."
    ],
    cons: [
      "The overall complexity of the code may increase since the pattern requires creating multiple new classes."
    ],
    snippets: [
      {
        language: "typescript",
        code: `class House {
  public walls = 0;
  public doors = 0;
  public hasPool = false;
  public hasGarden = false;

  public describe(): void {
    console.log(\`House with \${this.walls} walls, \${this.doors} doors, \` +
                \`pool: \${this.hasPool}, garden: \${this.hasGarden}\`);
  }
}

class HouseBuilder {
  private house: House;

  constructor() {
    this.house = new House();
  }

  public reset(): this {
    this.house = new House();
    return this;
  }

  public buildWalls(count: number): this {
    this.house.walls = count;
    return this;
  }

  public buildDoors(count: number): this {
    this.house.doors = count;
    return this;
  }

  public addPool(): this {
    this.house.hasPool = true;
    return this;
  }

  public addGarden(): this {
    this.house.hasGarden = true;
    return this;
  }

  public getResult(): House {
    const product = this.house;
    this.reset();
    return product;
  }
}

// Usage:
const builder = new HouseBuilder();
const luxuryVilla = builder
  .buildWalls(8)
  .buildDoors(4)
  .addPool()
  .addGarden()
  .getResult();

luxuryVilla.describe();`
      },
      {
        language: "python",
        code: `class House:
    def __init__(self):
        self.walls = 0
        self.doors = 0
        self.has_pool = False
        self.has_garden = False

    def describe(self):
        print(f"House with {self.walls} walls, {self.doors} doors, "
              f"pool: {self.has_pool}, garden: {self.has_garden}")

class HouseBuilder:
    def __init__(self):
        self._house = House()

    def reset(self):
        self._house = House()
        return self

    def build_walls(self, count: int):
        self._house.walls = count
        return self

    def build_doors(self, count: int):
        self._house.doors = count
        return self

    def add_pool(self):
        self._house.has_pool = True
        return self

    def add_garden(self):
        self._house.has_garden = True
        return self

    def get_result(self) -> House:
        product = self._house
        self.reset()
        return product

# Usage
builder = HouseBuilder()
simple_cabin = builder.build_walls(4).build_doors(1).get_result()
simple_cabin.describe()`
      },
      {
        language: "java",
        code: `class House {
    int walls = 0;
    int doors = 0;
    boolean hasPool = false;
    boolean hasGarden = false;

    void describe() {
        System.out.println("House with " + walls + " walls, " + doors + " doors, " +
                           "pool: " + hasPool + ", garden: " + hasGarden);
    }
}

class HouseBuilder {
    private House house = new House();

    public HouseBuilder reset() {
        this.house = new House();
        return this;
    }

    public HouseBuilder buildWalls(int count) {
        this.house.walls = count;
        return this;
    }

    public HouseBuilder buildDoors(int count) {
        this.house.doors = count;
        return this;
    }

    public HouseBuilder addPool() {
        this.house.hasPool = true;
        return this;
    }

    public HouseBuilder addGarden() {
        this.house.hasGarden = true;
        return this;
    }

    public House getResult() {
        House product = this.house;
        this.reset();
        return product;
    }
}`
      },
      {
        language: "cpp",
        code: `#include <iostream>
#include <string>

class House {
public:
    int walls = 0;
    int doors = 0;
    bool hasPool = false;
    bool hasGarden = false;

    void describe() const {
        std::cout << "House with " << walls << " walls, " << doors << " doors, "
                  << "pool: " << (hasPool ? "Yes" : "No") 
                  << ", garden: " << (hasGarden ? "Yes" : "No") << "\\n";
    }
};

class HouseBuilder {
private:
    House* house;

public:
    HouseBuilder() { house = new House(); }
    ~HouseBuilder() { delete house; }

    HouseBuilder* reset() {
        house = new House();
        return this;
    }

    HouseBuilder* buildWalls(int count) {
        house->walls = count;
        return this;
    }

    HouseBuilder* buildDoors(int count) {
        house->doors = count;
        return this;
    }

    HouseBuilder* addPool() {
        house->hasPool = true;
        return this;
    }

    HouseBuilder* addGarden() {
        house->hasGarden = true;
        return this;
    }

    House* getResult() {
        House* product = house;
        house = new House(); // Reset for next build
        return product;
    }
};`
      },
      {
        language: "csharp",
        code: `using System;

public class House {
    public int Walls { get; set; } = 0;
    public int Doors { get; set; } = 0;
    public bool HasPool { get; set; } = false;
    public bool HasGarden { get; set; } = false;

    public void Describe() {
        Console.WriteLine($"House with {Walls} walls, {Doors} doors, " +
                          $"pool: {(HasPool ? "Yes" : "No")}, " +
                          $"garden: {(HasGarden ? "Yes" : "No")}");
    }
}

public class HouseBuilder {
    private House _house = new House();

    public HouseBuilder Reset() {
        _house = new House();
        return this;
    }

    public HouseBuilder BuildWalls(int count) {
        _house.Walls = count;
        return this;
    }

    public HouseBuilder BuildDoors(int count) {
        _house.Doors = count;
        return this;
    }

    public HouseBuilder AddPool() {
        _house.HasPool = true;
        return this;
    }

    public HouseBuilder AddGarden() {
        _house.HasGarden = true;
        return this;
    }

    public House GetResult() {
        House product = _house;
        Reset();
        return product;
    }
}`
      }
    ],
    relatedPatterns: ["singleton", "factory-method"]
  },
  {
    id: "adapter",
    title: "Adapter",
    category: "structural",
    difficulty: "Beginner",
    tagline: "Allow objects with incompatible interfaces to collaborate.",
    intent: "Adapter is a structural design pattern that allows objects with incompatible interfaces to collaborate.",
    problem: "Imagine that you're creating a stock market monitoring app. The app downloads the stock data from multiple sources in XML format and then displays nice-looking charts for the user. At some point, you decide to improve the app by integrating a smart 3rd-party analytics library. But there's a catch: the analytics library only works with data in JSON format.",
    solution: "You can create an adapter. This is a special object that converts the interface of one object so that another object can understand it. An adapter wraps one of the objects to hide the complexity of conversion happening behind the scenes.",
    analogy: "When you travel from the US to Europe, you cannot plug your standard American laptop charger directly into a European wall socket. You need a power plug adapter that adapts the American plug pins to the European sockets, allowing the charger to draw electrical power safely.",
    diagram: `┌────────────────────────┐
│         Client         │
└───────────┬────────────┘
            │ calls
┌───────────▼────────────┐
│      XMLToJSONAdapter  │
├────────────────────────┤
│ - xmlService: XML      │
├────────────────────────┤
│ + getJSONData(): JSON  │─────┐
└────────────────────────┘     │ converts & delegates
                               ▼
                        ┌──────────────┐
                        │  XMLService  │
                        └──────────────┘`,
    pros: [
      "Single Responsibility Principle. You can separate the interface or data conversion code from the primary business logic of the program.",
      "Open/Closed Principle. You can introduce new adapters into the program without breaking the existing client code, as long as they work with the adapters through the client interface."
    ],
    cons: [
      "The overall complexity of the code increases because you need to introduce a set of new interfaces and classes. Sometimes it's simpler just to change the service class so that it matches the rest of your code."
    ],
    snippets: [
      {
        language: "typescript",
        code: `// Target: The format expected by our UI charts
interface JSONAnalyticData {
  fetchJson(): string;
}

// Adaptee: The third-party service returning XML
class LegacyXmlStockService {
  public getXmlData(): string {
    return "<stocks><stock><ticker>GOOG</ticker><price>180</price></stock></stocks>";
  }
}

// Adapter: Translates XML to JSON on the fly
class StockXmlToJsonAdapter implements JSONAnalyticData {
  private xmlService: LegacyXmlStockService;

  constructor(xmlService: LegacyXmlStockService) {
    this.xmlService = xmlService;
  }

  public fetchJson(): string {
    const xml = this.xmlService.getXmlData();
    // In real life, we would write a robust XML parser. Here is a simple conversion:
    const ticker = xml.match(/<ticker>(.*?)<\\/ticker>/)?.[1] || "";
    const price = xml.match(/<price>(.*?)<\\/price>/)?.[1] || "";
    
    return JSON.stringify({ ticker, price: parseFloat(price) });
  }
}

// Usage:
const xmlService = new LegacyXmlStockService();
const adapter = new StockXmlToJsonAdapter(xmlService);

console.log("Adapted JSON output:", adapter.fetchJson());`
      },
      {
        language: "python",
        code: `import json
import re

class LegacyXmlStockService:
    def get_xml_data(self) -> str:
        return "<stocks><stock><ticker>AAPL</ticker><price>210</price></stock></stocks>"

class StockXmlToJsonAdapter:
    def __init__(self, xml_service: LegacyXmlStockService):
        self.xml_service = xml_service

    def fetch_json(self) -> str:
        xml = self.xml_service.get_xml_data()
        
        # Extrapolate values via regex
        ticker = re.search(r"<ticker>(.*?)</ticker>", xml).group(1)
        price = float(re.search(r"<price>(.*?)</price>", xml).group(1))
        
        return json.dumps({"ticker": ticker, "price": price})

# Usage:
xml_svc = LegacyXmlStockService()
adapter = StockXmlToJsonAdapter(xml_svc)
print(adapter.fetch_json())`
      },
      {
        language: "java",
        code: `// Client Interface
interface JsonAnalytics {
    String fetchJson();
}

// Adaptee
class LegacyXmlService {
    public String getXml() {
        return "<ticker>MSFT</ticker><price>420</price>";
    }
}

// Adapter
class XmlToJsonAdapter implements JsonAnalytics {
    private LegacyXmlService xmlService;

    public XmlToJsonAdapter(LegacyXmlService service) {
        this.xmlService = service;
    }

    @Override
    public String fetchJson() {
        String xml = xmlService.getXml();
        // Crude parse for demonstration
        String ticker = xml.substring(xml.indexOf("<ticker>") + 8, xml.indexOf("</ticker>"));
        String price = xml.substring(xml.indexOf("<price>") + 7, xml.indexOf("</price>"));
        
        return "{\\"ticker\\": \\"" + ticker + "\\", \\"price\\": " + price + "}";
    }
}`
      },
      {
        language: "cpp",
        code: `#include <iostream>
#include <string>

// Target Interface
class JsonAnalytics {
public:
    virtual ~JsonAnalytics() {}
    virtual std::string fetchJson() = 0;
};

// Adaptee
class LegacyXmlService {
public:
    std::string getXml() {
        return "<ticker>NVDA</ticker><price>125</price>";
    }
};

// Adapter
class XmlToJsonAdapter : public JsonAnalytics {
private:
    LegacyXmlService* xmlService;

public:
    XmlToJsonAdapter(LegacyXmlService* service) : xmlService(service) {}

    std::string fetchJson() override {
        std::string xml = xmlService->getXml();
        // Perform standard string slicing
        size_t tickerStart = xml.find("<ticker>") + 8;
        size_t tickerEnd = xml.find("</ticker>");
        std::string ticker = xml.substr(tickerStart, tickerEnd - tickerStart);

        size_t priceStart = xml.find("<price>") + 7;
        size_t priceEnd = xml.find("</price>");
        std::string price = xml.substr(priceStart, priceEnd - priceStart);

        return "{\\"ticker\\": \\"" + ticker + "\\", \\"price\\": " + price + "}";
    }
};`
      },
      {
        language: "csharp",
        code: `using System;

// Target Interface
public interface IJsonAnalytics {
    string FetchJson();
}

// Adaptee
public class LegacyXmlService {
    public string GetXml() {
        return "<ticker>NVDA</ticker><price>125</price>";
    }
}

// Adapter
public class XmlToJsonAdapter : IJsonAnalytics {
    private readonly LegacyXmlService _xmlService;

    public XmlToJsonAdapter(LegacyXmlService service) {
        _xmlService = service;
    }

    public string FetchJson() {
        string xml = _xmlService.GetXml();
        
        int tickerStart = xml.IndexOf("<ticker>") + 8;
        int tickerEnd = xml.IndexOf("</ticker>");
        string ticker = xml.Substring(tickerStart, tickerEnd - tickerStart);

        int priceStart = xml.IndexOf("<price>") + 7;
        int priceEnd = xml.IndexOf("</price>");
        string price = xml.Substring(priceStart, priceEnd - priceStart);

        return $"{{\\"ticker\\": \\"{ticker}\\", \\"price\\": {price}}}";
    }
}`
      }
    ],
    relatedPatterns: ["facade", "decorator"]
  },
  {
    id: "decorator",
    title: "Decorator",
    category: "structural",
    difficulty: "Intermediate",
    tagline: "Attach new behaviors to objects dynamically by placing these objects inside special wrapper objects that contain the behaviors.",
    intent: "Decorator is a structural design pattern that lets you attach new behaviors to objects dynamically by placing these objects inside special wrapper objects that contain the behaviors.",
    problem: "Imagine you are building a notification library. The initial version can send standard email notifications. Soon, your users ask for more options: SMS, Facebook, Slack, and Push notifications. If you use standard inheritance, you will end up with an explosion of subclasses like `EmailAndSmsNotifier`, `EmailSmsAndSlackNotifier`, etc.",
    solution: "Wrapping is the alternative. A wrapper is an object that can be linked with some target object. The wrapper contains the same set of methods as the target and delegates all requests it receives to it. However, the wrapper can alter the result by doing something before or after delegating the request.",
    analogy: "Wearing clothes is an everyday analogy. When you are cold, you wrap yourself in a sweater. If it's raining, you wrap yourself further with a raincoat. All these layers 'decorate' your basic warmth without changing who you are, and you can put them on or take them off at will.",
    diagram: `┌────────────────────────────────────────┐
│               Notifier                 │
├────────────────────────────────────────┤
│ + send(message: string)                │
└───────────────────▲────────────────────┘
                    │
            ┌───────┴───────┐
    ┌───────┴───────┐       │
    │ EmailNotifier │ ┌─────┴──────────────┐
    └───────────────┘ │ BaseDecorator      │
                      ├────────────────────┤
                      │ - wrapped: Notifier│
                      └────────────────────┘`,
    pros: [
      "You can extend an object's behavior without making a new subclass.",
      "You can add or remove responsibilities from an object at runtime.",
      "You can combine several behaviors by wrapping an object in multiple decorators."
    ],
    cons: [
      "It's hard to remove a specific wrapper from the wrappers stack.",
      "It's difficult to implement a decorator in such a way that its behavior doesn't depend on the order in the decorators stack.",
      "The initial configuration code of layers might look pretty ugly."
    ],
    snippets: [
      {
        language: "typescript",
        code: `// Common interface
interface Notifier {
  send(message: string): void;
}

// Basic concrete component
class EmailNotifier implements Notifier {
  send(message: string): void {
    console.log(\`Sending email notification: \${message}\`);
  }
}

// Base Decorator
abstract class NotifierDecorator implements Notifier {
  protected wrapped: Notifier;

  constructor(notifier: Notifier) {
    this.wrapped = notifier;
  }

  send(message: string): void {
    this.wrapped.send(message);
  }
}

// Concrete Decorator 1
class SmsDecorator extends NotifierDecorator {
  send(message: string): void {
    super.send(message);
    this.sendSms(message);
  }

  private sendSms(message: string): void {
    console.log(\`Sending SMS notification: \${message}\`);
  }
}

// Concrete Decorator 2
class SlackDecorator extends NotifierDecorator {
  send(message: string): void {
    super.send(message);
    this.sendSlack(message);
  }

  private sendSlack(message: string): void {
    console.log(\`Posting Slack message: \${message}\`);
  }
}

// Usage:
let notifier: Notifier = new EmailNotifier();
// Wrap email with SMS alerts
notifier = new SmsDecorator(notifier);
// Also wrap with Slack notifications
notifier = new SlackDecorator(notifier);

notifier.send("System Alert: High CPU usage!");`
      },
      {
        language: "python",
        code: `class Notifier:
    def send(self, message: str) -> None:
        pass

class EmailNotifier(Notifier):
    def send(self, message: str) -> None:
        print(f"Sending email notification: {message}")

class NotifierDecorator(Notifier):
    def __init__(self, notifier: Notifier):
        self._wrapped = notifier

    def send(self, message: str) -> None:
        self._wrapped.send(message)

class SmsDecorator(NotifierDecorator):
    def send(self, message: str) -> None:
        super().send(message)
        print(f"Sending SMS notification: {message}")

class SlackDecorator(NotifierDecorator):
    def send(self, message: str) -> None:
        super().send(message)
        print(f"Posting Slack message: {message}")

# Usage:
stack = EmailNotifier()
stack = SmsDecorator(stack)
stack = SlackDecorator(stack)

stack.send("System Alert: Connection Dropped!")`
      },
      {
        language: "java",
        code: `interface Notifier {
    void send(String message);
}

class EmailNotifier implements Notifier {
    public void send(String message) {
        System.out.println("Sending Email: " + message);
    }
}

abstract class NotifierDecorator implements Notifier {
    protected Notifier wrapped;

    public NotifierDecorator(Notifier wrapped) {
        this.wrapped = wrapped;
    }

    public void send(String message) {
        wrapped.send(message);
    }
}

class SmsDecorator extends NotifierDecorator {
    public SmsDecorator(Notifier wrapped) { super(wrapped); }

    public void send(String message) {
        super.send(message);
        System.out.println("Sending SMS: " + message);
    }
}`
      },
      {
        language: "cpp",
        code: `#include <iostream>
#include <memory>
#include <string>

class Notifier {
public:
    virtual ~Notifier() {}
    virtual void send(const std::string& message) = 0;
};

class EmailNotifier : public Notifier {
public:
    void send(const std::string& message) override {
        std::cout << "Sending Email: " << message << "\\n";
    }
};

class NotifierDecorator : public Notifier {
protected:
    std::unique_ptr<Notifier> wrapped;
public:
    NotifierDecorator(std::unique_ptr<Notifier> component) : wrapped(std::move(component)) {}
    void send(const std::string& message) override {
        wrapped->send(message);
    }
};

class SmsDecorator : public NotifierDecorator {
public:
    SmsDecorator(std::unique_ptr<Notifier> component) : NotifierDecorator(std::move(component)) {}
    void send(const std::string& message) override {
        NotifierDecorator::send(message);
        std::cout << "Sending SMS: " << message << "\\n";
    }
};`
      },
      {
        language: "csharp",
        code: `using System;

public interface INotifier {
    void Send(string message);
}

public class EmailNotifier : INotifier {
    public void Send(string message) {
        Console.WriteLine($"Sending Email: {message}");
    }
}

public abstract class NotifierDecorator : INotifier {
    protected readonly INotifier _wrapped;

    protected NotifierDecorator(INotifier wrapped) {
        _wrapped = wrapped;
    }

    public virtual void Send(string message) {
        _wrapped.Send(message);
    }
}

public class SmsDecorator : NotifierDecorator {
    public SmsDecorator(INotifier wrapped) : base(wrapped) {}

    public override void Send(string message) {
        base.Send(message);
        Console.WriteLine($"Sending SMS: {message}");
    }
}`
      }
    ],
    relatedPatterns: ["adapter", "facade"]
  },
  {
    id: "facade",
    title: "Facade",
    category: "structural",
    difficulty: "Beginner",
    tagline: "Provide a simplified interface to a library, a framework, or any other complex set of classes.",
    intent: "Facade is a structural design pattern that provides a simplified interface to a library, a framework, or any other complex set of classes.",
    problem: "When utilizing a highly complex third-party software library, you must initialize dozens of active objects, orchestrate delicate dependencies, run methods in the exact correct sequence, and handle internal details. The client code becomes tightly coupled to the implementation classes of the library.",
    solution: "A facade is a class that provides a simple interface to a complex subsystem. It handles all structural interactions, configuration, error catching, and sequencing, exposing only the methods the client actually needs. If you only need a fraction of a library's capabilities, the facade handles the heavy lifting.",
    analogy: "When you call a restaurant to place a food order, the receptionist is your Facade. Behind the scenes, the subsystem is huge: cooks, dishwashers, suppliers, cashiers. You don't interact with them individually; you talk to the single receptionist who handles the process for you.",
    diagram: `┌────────────────────────────────────────┐
│             PaymentFacade              │
├────────────────────────────────────────┤
│ + processOrder(id, amount)             │
└───────────┬──────────────┬─────────────┘
            │ initializes  │ orchestrates
┌───────────▼───┐  ┌───────▼───────┐  ┌──▼────────────┐
│ SecurityCheck │  │ LedgerBooking │  │ GatewayCharge │
└───────────────┘  └───────────────┘  └───────────────┘`,
    pros: [
      "You can isolate your code from the complexity of a subsystem.",
      "Promotes loose coupling between subsystems and client code."
    ],
    cons: [
      "A facade can become a god object coupled to all classes of an app."
    ],
    snippets: [
      {
        language: "typescript",
        code: `// Complex subsystem components
class VideoFile {
  constructor(public filename: string) {}
}

class OggCompressionCodec {}
class MPEG4CompressionCodec {}

class CodecFactory {
  static extract(file: VideoFile): string {
    console.log("CodecFactory: extracting file codec...");
    return "mpeg4";
  }
}

class BitrateReader {
  static read(filename: string, codec: string): string {
    console.log("BitrateReader: reading audio/video bitrate...");
    return "high";
  }
  static convert(buffer: string): string {
    return "converted-buffer";
  }
}

// Facade: Simplified wrapper
class VideoConverterFacade {
  public convertVideo(filename: string, format: "mp4" | "ogg"): File {
    console.log("VideoConverterFacade: starting high-quality conversion...");
    const file = new VideoFile(filename);
    const sourceCodec = CodecFactory.extract(file);
    const buffer = BitrateReader.read(filename, sourceCodec);
    const result = BitrateReader.convert(buffer);
    console.log("VideoConverterFacade: conversion completed successfully.");
    return {} as File;
  }
}

// Usage:
const converter = new VideoConverterFacade();
converter.convertVideo("cats.avi", "mp4");`
      },
      {
        language: "python",
        code: `class VideoFile:
    def __init__(self, filename):
        self.filename = filename

class CodecFactory:
    @staticmethod
    def extract(file):
        print("CodecFactory: extracting codec...")
        return "mp4"

class BitrateReader:
    @staticmethod
    def read(filename, codec):
        print("BitrateReader: reading video streams...")
        return "buffer"
    @staticmethod
    def convert(buffer):
        return "mp4-stream"

# Facade
class VideoConverterFacade:
    def convert_video(self, filename: str, target_format: str):
        print("VideoConverter: Starting conversion...")
        file = VideoFile(filename)
        codec = CodecFactory.extract(file)
        buffer = BitrateReader.read(filename, codec)
        result = BitrateReader.convert(buffer)
        print("VideoConverter: Finished successfully!")
        return result

# Usage:
converter = VideoConverterFacade()
converter.convert_video("holiday.avi", "mp4")`
      },
      {
        language: "java",
        code: `class VideoFile {
    String name;
    public VideoFile(String name) { this.name = name; }
}

class CodecFactory {
    public static String extract(VideoFile file) {
        System.out.println("Extracting codec...");
        return "ogg";
    }
}

class VideoConverterFacade {
    public void convertVideo(String fileName, String format) {
        System.out.println("Facade: Converting " + fileName + " to " + format);
        VideoFile file = new VideoFile(fileName);
        String codec = CodecFactory.extract(file);
        System.out.println("Facade: Conversion completed!");
    }
}`
      },
      {
        language: "cpp",
        code: `#include <iostream>
#include <string>

class VideoFile {
public:
    std::string name;
    VideoFile(std::string name) : name(name) {}
};

class VideoConverterFacade {
public:
    void convertVideo(const std::string& name, const std::string& format) {
        std::cout << "Facade: loading file " << name << "\\n";
        std::cout << "Facade: resolving compression codecs...\\n";
        std::cout << "Facade: conversion complete!\\n";
    }
};`
      },
      {
        language: "csharp",
        code: `using System;

public class VideoFile {
    public string Name { get; }
    public VideoFile(string name) {
        Name = name;
    }
}

public class CodecFactory {
    public static string Extract(VideoFile file) {
        Console.WriteLine("Extracting codec...");
        return "ogg";
    }
}

public class VideoConverterFacade {
    public void ConvertVideo(string fileName, string format) {
        Console.WriteLine($"Facade: Converting {fileName} to {format}");
        VideoFile file = new VideoFile(fileName);
        string codec = CodecFactory.Extract(file);
        Console.WriteLine("Facade: Conversion completed!");
    }
}`
      }
    ],
    relatedPatterns: ["adapter", "singleton"]
  },
  {
    id: "observer",
    title: "Observer",
    category: "behavioral",
    difficulty: "Intermediate",
    tagline: "Define a subscription mechanism to notify multiple objects about any events that happen to the object they're observing.",
    intent: "Observer is a behavioral design pattern that lets you define a subscription mechanism to notify multiple objects about any events that happen to the object they're observing.",
    problem: "Imagine you have two objects: a `Customer` and a `Store`. The customer is very interested in a new brand of product (say, an iPhone) which is expected to become available soon. The customer can visit the store every day to check product availability, but most of these trips will be in vain. Alternatively, the store could send spam emails to all customers each time a new product is added, which would annoy other customers.",
    solution: "The object that has some interesting state is often called the subject, but since it's going to notify other objects about its changes, we'll call it the publisher. All other objects that want to track changes to the publisher's state are called subscribers or observers. The Publisher class stores an array of subscriber objects and provides subscription methods (`attach`, `detach`).",
    analogy: "A magazine subscription is a classic analogy. You subscribe to a monthly magazine (like Wired). When a new issue is published, the publisher delivers it directly to your mailbox. You don't have to walk to the newsstand every day. Other people who are not subscribed don't receive anything.",
    diagram: `┌────────────────────────────────────────┐
│               Publisher                │
├────────────────────────────────────────┤
│ - subscribers: Observer[]              │
├────────────────────────────────────────┤
│ + subscribe(o: Observer)               │
│ + unsubscribe(o: Observer)             │
│ + notify()                             │
└───────────────────┬────────────────────┘
                    │ notifies
┌───────────────────▼────────────────────┐
│                Observer                │
├────────────────────────────────────────┤
│ + update(state: string)                │
└────────────────────────────────────────┘`,
    pros: [
      "Open/Closed Principle. You can introduce new subscriber classes without having to change the publisher's code (and vice-versa).",
      "You can establish relations between objects at runtime."
    ],
    cons: [
      "Subscribers are notified in random order.",
      "The coupling can become hard to manage in complex architectures, leading to memory leaks if subscribers aren't cleaned up (detached) properly."
    ],
    snippets: [
      {
        language: "typescript",
        code: `// Subscriber Interface
interface Observer {
  update(message: string): void;
}

// Publisher (Subject)
class StockMarketPublisher {
  private observers: Observer[] = [];
  private latestPrice = 0;

  public subscribe(observer: Observer): void {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
    }
  }

  public unsubscribe(observer: Observer): void {
    this.observers = this.observers.filter(o => o !== observer);
  }

  public setPrice(newPrice: number): void {
    console.log(\`StockMarket: Price updated to \$\${newPrice}\`);
    this.latestPrice = newPrice;
    this.notifyAll();
  }

  private notifyAll(): void {
    const msg = \`Latest stock price: \$\${this.latestPrice}\`;
    for (const observer of this.observers) {
      observer.update(msg);
    }
  }
}

// Concrete Observer 1
class MobileAppAlerts implements Observer {
  update(message: string): void {
    console.log(\`Mobile Push Alert -> \${message}\`);
  }
}

// Concrete Observer 2
class AnalyticsDashboard implements Observer {
  update(message: string): void {
    console.log(\`Analytics DB logger -> Logged price change: \${message}\`);
  }
}

// Usage:
const market = new StockMarketPublisher();
const mobileApp = new MobileAppAlerts();
const dashboard = new AnalyticsDashboard();

market.subscribe(mobileApp);
market.subscribe(dashboard);

market.setPrice(145.50);`
      },
      {
        language: "python",
        code: `class Observer:
    def update(self, message: str) -> None:
        pass

class StockMarketPublisher:
    def __init__(self):
        self._subscribers = []

    def subscribe(self, subscriber: Observer):
        if subscriber not in self._subscribers:
            self._subscribers.append(subscriber)

    def unsubscribe(self, subscriber: Observer):
        self._subscribers.remove(subscriber)

    def set_price(self, price: float):
        print(f"StockMarket: Price updated to \${price}")
        self.notify_all(f"Stock update: \${price}")

    def notify_all(self, message: str):
        for sub in self._subscribers:
            sub.update(message)

class MobileAppAlerts(Observer):
    def update(self, message: str):
        print(f"Mobile Alert: {message}")

# Usage:
market = StockMarketPublisher()
app = MobileAppAlerts()
market.subscribe(app)
market.set_price(185.00)`
      },
      {
        language: "java",
        code: `import java.util.ArrayList;
import java.util.List;

interface Observer {
    void update(String message);
}

class Publisher {
    private List<Observer> subscribers = new ArrayList<>();

    public void subscribe(Observer sub) { subscribers.add(sub); }
    public void unsubscribe(Observer sub) { subscribers.remove(sub); }

    public void updateState(String event) {
        System.out.println("Publisher: State changed!");
        for (Observer sub : subscribers) {
            sub.update(event);
        }
    }
}`
      },
      {
        language: "cpp",
        code: `#include <iostream>
#include <vector>
#include <algorithm>

class Observer {
public:
    virtual ~Observer() {}
    virtual void update(const std::string& msg) = 0;
};

class Publisher {
private:
    std::vector<Observer*> subscribers;
public:
    void subscribe(Observer* obs) {
        subscribers.push_back(obs);
    }
    void unsubscribe(Observer* obs) {
        subscribers.erase(std::remove(subscribers.begin(), subscribers.end(), obs), subscribers.end());
    }
    void notify(const std::string& msg) {
        for (auto* sub : subscribers) {
            sub->update(msg);
        }
    }
};`
      },
      {
        language: "csharp",
        code: `using System;
using System.Collections.Generic;

public interface IObserver {
    void Update(string message);
}

public class Publisher {
    private readonly List<IObserver> _subscribers = new List<IObserver>();

    public void Subscribe(IObserver sub) {
        _subscribers.Add(sub);
    }

    public void Unsubscribe(IObserver sub) {
        _subscribers.Remove(sub);
    }

    public void UpdateState(string @event) {
        Console.WriteLine("Publisher: State changed!");
        foreach (var sub in _subscribers) {
            sub.Update(@event);
        }
    }
}`
      }
    ],
    relatedPatterns: ["strategy", "state"]
  },
  {
    id: "strategy",
    title: "Strategy",
    category: "behavioral",
    difficulty: "Beginner",
    tagline: "Define a family of algorithms, put each of them into a separate class, and make their objects interchangeable.",
    intent: "Strategy is a behavioral design pattern that lets you define a family of algorithms, put each of them into a separate class, and make their objects interchangeable.",
    problem: "Imagine you decide to create a navigation app for travelers. The app is centered around a beautiful map which helps users quickly orient themselves. At first, the app can only calculate routes for driving. Over time, you add walking, public transit, bicycling, and sightseeing routes. The main `Navigator` class grows massive with bloated conditional statements.",
    solution: "The Strategy pattern suggests that you take a class that does something specific in a lot of different ways and extract all of these algorithms into separate classes called strategies. The original class, called context, must have a field for storing a reference to one of the strategies.",
    analogy: "Getting to the airport is a Strategy pattern. You have multiple ways to travel: take a personal car, take a bus, hail an Uber, or ride a bicycle. These strategies achieve the same goal (getting to the airport), but vary in cost, duration, and effort. You choose one based on your current constraints.",
    diagram: `┌────────────────────────────────────────┐
│                Context                 │
├────────────────────────────────────────┤
│ - strategy: RouteStrategy              │
├────────────────────────────────────────┤
│ + setStrategy(strategy)                │
│ + buildRoute(A, B)                     │
└───────────────────┬────────────────────┘
                    │ delegates
┌───────────────────▼────────────────────┐
│             RouteStrategy              │
├────────────────────────────────────────┤
│ + buildRoute(A, B)                     │
└────────────────────────────────────────┘`,
    pros: [
      "You can swap algorithms used inside an object at runtime.",
      "You can isolate the implementation details of an algorithm from the code that uses it.",
      "You can replace inheritance with composition.",
      "Open/Closed Principle. You can introduce new strategies without having to change the context."
    ],
    cons: [
      "If you only have a couple of algorithms and they rarely change, there's no real reason to overcomplicate the program with new classes and interfaces.",
      "Clients must be aware of the differences between strategies to be able to select the right one."
    ],
    snippets: [
      {
        language: "typescript",
        code: `// Strategy Interface
interface RouteStrategy {
  calculateRoute(start: string, end: string): void;
}

// Concrete Strategy 1
class DrivingStrategy implements RouteStrategy {
  calculateRoute(start: string, end: string): void {
    console.log(\`Calculating driving route from \${start} to \${end} via highways.\`);
  }
}

// Concrete Strategy 2
class WalkingStrategy implements RouteStrategy {
  calculateRoute(start: string, end: string): void {
    console.log(\`Calculating scenic walking route from \${start} to \${end} via pedestrian pathways.\`);
  }
}

// Context Class
class NavigatorContext {
  private strategy: RouteStrategy;

  // We inject the default strategy
  constructor(strategy: RouteStrategy) {
    this.strategy = strategy;
  }

  public setStrategy(strategy: RouteStrategy): void {
    this.strategy = strategy;
  }

  public buildRoute(start: string, end: string): void {
    this.strategy.calculateRoute(start, end);
  }
}

// Usage:
const nav = new NavigatorContext(new DrivingStrategy());
nav.buildRoute("Central Station", "Airport"); // Driving

// Client swaps strategy at runtime
nav.setStrategy(new WalkingStrategy());
nav.buildRoute("Central Station", "Museum");  // Walking`
      },
      {
        language: "python",
        code: `class RouteStrategy:
    def calculate_route(self, start: str, end: str) -> None:
        pass

class DrivingStrategy(RouteStrategy):
    def calculate_route(self, start: str, end: str):
        print(f"Calculating driving route from {start} to {end} via freeway.")

class WalkingStrategy(RouteStrategy):
    def calculate_route(self, start: str, end: str):
        print(f"Calculating walking path from {start} to {end} via sidewalks.")

class NavigatorContext:
    def __init__(self, strategy: RouteStrategy):
        self._strategy = strategy

    def set_strategy(self, strategy: RouteStrategy):
        self._strategy = strategy

    def build_route(self, start: str, end: str):
        self._strategy.calculate_route(start, end)

# Usage:
nav = NavigatorContext(DrivingStrategy())
nav.build_route("Home", "Office")

nav.set_strategy(WalkingStrategy())
nav.build_route("Office", "Coffee Shop")`
      },
      {
        language: "java",
        code: `interface RouteStrategy {
    void calculateRoute(String start, String end);
}

class DrivingStrategy implements RouteStrategy {
    public void calculateRoute(String start, String end) {
        System.out.println("Calculating driving route from " + start + " to " + end);
    }
}

class NavigatorContext {
    private RouteStrategy strategy;

    public NavigatorContext(RouteStrategy strategy) {
        this.strategy = strategy;
    }

    public void setStrategy(RouteStrategy strategy) {
        this.strategy = strategy;
    }

    public void buildRoute(String start, String end) {
        strategy.calculateRoute(start, end);
    }
}`
      },
      {
        language: "cpp",
        code: `#include <iostream>
#include <memory>
#include <string>

class RouteStrategy {
public:
    virtual ~RouteStrategy() {}
    virtual void calculateRoute(const std::string& start, const std::string& end) = 0;
};

class DrivingStrategy : public RouteStrategy {
public:
    void calculateRoute(const std::string& start, const std::string& end) override {
        std::cout << "Driving route calculated from " << start << " to " << end << "\\n";
    }
};

class NavigatorContext {
private:
    std::unique_ptr<RouteStrategy> strategy;
public:
    NavigatorContext(std::unique_ptr<RouteStrategy> initialStrategy) : strategy(std::move(initialStrategy)) {}
    void setStrategy(std::unique_ptr<RouteStrategy> newStrategy) {
        strategy = std::move(newStrategy);
    }
    void buildRoute(const std::string& start, const std::string& end) {
        strategy->calculateRoute(start, end);
    }
};`
      },
      {
        language: "csharp",
        code: `using System;

public interface IRouteStrategy {
    void CalculateRoute(string start, string end);
}

public class DrivingStrategy : IRouteStrategy {
    public void CalculateRoute(string start, string end) {
        Console.WriteLine($"Calculating driving route from {start} to {end}");
    }
}

public class NavigatorContext {
    private IRouteStrategy _strategy;

    public NavigatorContext(IRouteStrategy strategy) {
        _strategy = strategy;
    }

    public void SetStrategy(IRouteStrategy strategy) {
        _strategy = strategy;
    }

    public void BuildRoute(string start, string end) {
        _strategy.CalculateRoute(start, end);
    }
}`
      }
    ],
    relatedPatterns: ["observer", "state"]
  },
  {
    id: "state",
    title: "State",
    category: "behavioral",
    difficulty: "Advanced",
    tagline: "Allow an object to alter its behavior when its internal state changes. The object will appear to change its class.",
    intent: "State is a behavioral design pattern that lets an object alter its behavior when its internal state changes. The object will appear to change its class.",
    problem: "The concept of State is closely related to the Finite State Machine. At any moment, there's a finite number of states a program can be in. In every state, the program behaves differently. Transitioning between states requires massive nested `if-else` or `switch` statements checking the current state before executing actions.",
    solution: "The State pattern suggests that you create new classes for all possible states of an object and extract all state-specific behaviors into these classes. Instead of implementing all behaviors on its own, the original object (called context) stores a reference to one of the state objects representing its current state, delegating all work to that object.",
    analogy: "A smartphone behaves differently based on its current power state. If the phone is Locked, pressing a key turns on the screen expecting a PIN code. If the phone is Unlocked, pressing a key opens an app. If the phone is Off (no battery), pressing a button does absolutely nothing.",
    diagram: `┌────────────────────────────────────────┐
│             AudioPlayer                │
├────────────────────────────────────────┤
│ - state: PlayerState                   │
├────────────────────────────────────────┤
│ + clickPlay()                          │
│ + changeState(state)                   │
└───────────────────┬────────────────────┘
                    │ delegates
┌───────────────────▼────────────────────┐
│              PlayerState               │
├────────────────────────────────────────┤
│ + clickPlay()                          │
└────────────────────────────────────────┘`,
    pros: [
      "Single Responsibility Principle. Organize the code related to particular states into separate classes.",
      "Open/Closed Principle. Introduce new states without changing existing state classes or the context.",
      "Simplify the code of the context by eliminating bulky state machine conditionals."
    ],
    cons: [
      "Applying the pattern can be overkill if a state machine has only a few states or rarely changes."
    ],
    snippets: [
      {
        language: "typescript",
        code: `// State Interface
interface State {
  clickPlay(player: AudioPlayer): void;
}

// Concrete State 1: Ready to play
class ReadyState implements State {
  clickPlay(player: AudioPlayer): void {
    console.log("State: Starting audio playback...");
    player.changeState(new PlayingState());
  }
}

// Concrete State 2: Currently playing
class PlayingState implements State {
  clickPlay(player: AudioPlayer): void {
    console.log("State: Pausing audio playback...");
    player.changeState(new PausedState());
  }
}

// Concrete State 3: Currently paused
class PausedState implements State {
  clickPlay(player: AudioPlayer): void {
    console.log("State: Resuming audio playback...");
    player.changeState(new PlayingState());
  }
}

// Context: The player maintaining state
class AudioPlayer {
  private state: State;

  constructor() {
    this.state = new ReadyState(); // Default initial state
  }

  public changeState(state: State): void {
    this.state = state;
  }

  public clickPlay(): void {
    this.state.clickPlay(this);
  }
}

// Usage:
const player = new AudioPlayer();
player.clickPlay(); // ReadyState -> "Starting audio playback..." (Sets PlayingState)
player.clickPlay(); // PlayingState -> "Pausing audio playback..." (Sets PausedState)
player.clickPlay(); // PausedState -> "Resuming audio playback..." (Sets PlayingState)`
      },
      {
        language: "python",
        code: `class State:
    def click_play(self, player) -> None:
        pass

class ReadyState(State):
    def click_play(self, player):
        print("Ready State: Starting playback...")
        player.change_state(PlayingState())

class PlayingState(State):
    def click_play(self, player):
        print("Playing State: Pausing playback...")
        player.change_state(PausedState())

class PausedState(State):
    def click_play(self, player):
        print("Paused State: Resuming playback...")
        player.change_state(PlayingState())

class AudioPlayer:
    def __init__(self):
        self._state = ReadyState()

    def change_state(self, state: State):
        self._state = state

    def click_play(self):
        self._state.click_play(self)

# Usage:
player = AudioPlayer()
player.click_play() # Starts playback
player.click_play() # Pauses playback`
      },
      {
        language: "java",
        code: `interface State {
    void clickPlay(AudioPlayer player);
}

class ReadyState implements State {
    public void clickPlay(AudioPlayer player) {
        System.out.println("Starting playback...");
        player.changeState(new PlayingState());
    }
}

class PlayingState implements State {
    public void clickPlay(AudioPlayer player) {
        System.out.println("Pausing playback...");
        player.changeState(new PausedState());
    }
}

class PausedState implements State {
    public void clickPlay(AudioPlayer player) {
        System.out.println("Resuming playback...");
        player.changeState(new PlayingState());
    }
}

class AudioPlayer {
    private State state = new ReadyState();

    public void changeState(State state) {
        this.state = state;
    }

    public void clickPlay() {
        state.clickPlay(this);
    }
}`
      },
      {
        language: "cpp",
        code: `#include <iostream>
#include <memory>

class AudioPlayer;

class State {
public:
    virtual ~State() {}
    virtual void clickPlay(AudioPlayer* player) = 0;
};

class AudioPlayer {
private:
    std::unique_ptr<State> state;
public:
    AudioPlayer(); // Constructor will define default ReadyState
    void changeState(std::unique_ptr<State> newState) {
        state = std::move(newState);
    }
    void clickPlay() {
        state->clickPlay(this);
    }
};`
      },
      {
        language: "csharp",
        code: `using System;

public interface IState {
    void ClickPlay(AudioPlayer player);
}

public class ReadyState : IState {
    public void ClickPlay(AudioPlayer player) {
        Console.WriteLine("Starting playback...");
        player.ChangeState(new PlayingState());
    }
}

public class PlayingState : IState {
    public void ClickPlay(AudioPlayer player) {
        Console.WriteLine("Pausing playback...");
        player.ChangeState(new PausedState());
    }
}

public class PausedState : IState {
    public void ClickPlay(AudioPlayer player) {
        Console.WriteLine("Resuming playback...");
        player.ChangeState(new PlayingState());
    }
}

public class AudioPlayer {
    private IState _state = new ReadyState();

    public void ChangeState(IState state) {
        _state = state;
    }

    public void ClickPlay() {
        _state.ClickPlay(this);
    }
}`
      }
    ],
    relatedPatterns: ["strategy", "observer"]
  }
];

const patternTags: Record<string, string[]> = {
  "singleton": ["Thread-safe", "Global State", "Resource Management"],
  "factory-method": ["Decoupling", "Object Creation", "Extensibility"],
  "builder": ["Object Creation", "Complexity Reduction", "Fluent Interface"],
  "adapter": ["Interface Compatibility", "Decoupling", "Integration"],
  "decorator": ["Extensibility", "Single Responsibility", "Composition"],
  "facade": ["Simplicity", "Decoupling", "API Wrapper"],
  "observer": ["Event-driven", "Decoupling", "Reactivity"],
  "strategy": ["Interchangeable Algorithms", "Decoupling", "Open-Closed Principle"],
  "state": ["State Management", "Decoupling", "Behavioral Dynamic"]
};

designPatterns.forEach((p) => {
  p.tags = patternTags[p.id] || [];
});

