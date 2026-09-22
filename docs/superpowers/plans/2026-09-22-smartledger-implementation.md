# SmartLedger Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete Smart Home Utility & Household Resource Management System (SmartLedger) featuring fair-split sub-metering, LPG depletion prediction, telecom countdown matrices, commute fuel efficiency, grocery category spend tracking, and glassmorphic Chart.js visualizations.

**Architecture:** Layered Spring Boot 3 MVC and REST application using Java 21, Spring Data JPA, and MySQL JDBC. Business rules and mathematical engines are strictly decoupled from the web layer to showcase core Java OOP concepts (inheritance, strategy pattern, stream aggregations, custom exceptions) and enable 100% test-driven development (TDD).

**Tech Stack:** Java 21, Spring Boot 3.3.x, Spring Data JPA, MySQL Connector/J (JDBC), Thymeleaf, Chart.js 4.x, JUnit 5, AssertJ, Maven.

**Spec:** `docs/superpowers/specs/2026-09-22-smartledger-design.md`

## Global Constraints

- Platform: Java 21 LTS with Maven build system.
- Database: MySQL 8.x schema with JDBC driver (`com.mysql:mysql-connector-j`) and Spring Data JPA / Hibernate ORM.
- Academic Alignment: Core OOP (Inheritance via `BaseUtilityRecord`, Strategy pattern via `TariffCalculationStrategy`, Polymorphism, Encapsulation, Custom Exception hierarchy, Java Streams, Java Records).
- Testing: TDD strictly followed with JUnit 5 and AssertJ — failing test verified before any implementation code.
- Frontend: Vanilla Glassmorphic CSS with dark theme (`#0d1117`, `#161b22`), Inter font, responsive layout, Chart.js 4.x visualizations via REST analytics endpoints.

## Review Focus

1. **Sub-meter Over-allocation**: When individual sub-meters sum to zero ($U_{\text{sub\_total}} = 0$) or exceed master units ($U_{\text{sub\_total}} > U_{\text{EB}}$ due to meter drift), the fair-split engine must handle divide-by-zero safely and flag drift rather than crashing.
2. **First-time Gas Cylinder Depletion**: When a user logs an active cylinder with zero past finished cylinders, the depletion engine must safely fall back to the domestic baseline burn rate ($0.45\text{ kg/day}$) without null pointer exceptions.
3. **Negative Meter Reading & Temporal Inversion**: Negative electricity consumption or cylinder finish dates occurring before connection dates must trigger domain validation exceptions before persistence.
4. **Consecutive Fuel Entries with Stale/Non-increasing Odometers**: When consecutive vehicle entries record decreasing or non-increasing odometer values, mileage calculations must gracefully reject invalid data rather than returning negative or infinite fuel efficiency.
5. **Session Expiry on Form Submission**: Submitting a utility record entry when session expires should redirect to `/login` with an informative error message instead of an unhandled HTTP 500.

---

### Task 1: Project Setup & Maven Build Configuration

**Files:**
- Create: `pom.xml`
- Create: `.gitignore`
- Create: `src/main/resources/application.properties`
- Create: `src/main/java/com/smartledger/SmartLedgerApplication.java`
- Test: `src/test/java/com/smartledger/SmartLedgerApplicationTests.java`

**Interfaces:**
- Consumes: None (bootstrap task)
- Produces: Runnable Spring Boot application context and Maven test runner

- [ ] **Step 1: Write the failing application context test**

Create `src/test/java/com/smartledger/SmartLedgerApplicationTests.java`:
```java
package com.smartledger;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class SmartLedgerApplicationTests {

    @Test
    void contextLoads() {
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```powershell
mvn test -Dtest=SmartLedgerApplicationTests
```
Expected: FAIL (or compilation failure because `SmartLedgerApplication` and `pom.xml` do not exist yet).

- [ ] **Step 3: Write minimal Maven configuration and Spring Boot main class**

Create `pom.xml`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.4</version>
        <relativePath/>
    </parent>
    <groupId>com.smartledger</groupId>
    <artifactId>smartledger</artifactId>
    <version>1.0.0</version>
    <name>SmartLedger</name>
    <description>Smart Home Utility &amp; Household Resource Management System</description>

    <properties>
        <java.version>21</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-thymeleaf</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-crypto</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

Create `src/main/resources/application.properties`:
```properties
spring.application.name=SmartLedger
server.port=8080

# Database Configuration (MySQL)
spring.datasource.url=${DB_URL:jdbc:mysql://localhost:3306/smartledger_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC}
spring.datasource.username=${DB_USER:root}
spring.datasource.password=${DB_PASS:root}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA & Hibernate Settings
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
spring.jpa.properties.hibernate.format_sql=true

# Thymeleaf Template Engine
spring.thymeleaf.cache=false
spring.thymeleaf.mode=HTML
```

Create `src/test/resources/application-test.properties`:
```properties
spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;MODE=MySQL
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect
```

Update `src/test/java/com/smartledger/SmartLedgerApplicationTests.java` with `@TestPropertySource(locations = "classpath:application-test.properties")`:
```java
package com.smartledger;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(locations = "classpath:application-test.properties")
class SmartLedgerApplicationTests {

    @Test
    void contextLoads() {
    }
}
```

Create `src/main/java/com/smartledger/SmartLedgerApplication.java`:
```java
package com.smartledger;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SmartLedgerApplication {
    public static void main(String[] args) {
        SpringApplication.run(SmartLedgerApplication.class, args);
    }
}
```

Create `.gitignore`:
```
target/
!.mvn/wrapper/maven-wrapper.jar
!**/src/main/**/target/
!**/src/test/**/target/

### STS ###
.apt_generated
.classpath
.factorypath
.project
.settings
.springBeans
.sts4-cache

### IntelliJ IDEA ###
.idea
*.iws
*.iml
*.ipr

### NetBeans ###
/nbproject/private/
/nbbuild/
/dist/
/nbdist/
/.nb-gradle/

### VS Code ###
.vscode/
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```powershell
mvn test -Dtest=SmartLedgerApplicationTests
```
Expected: BUILD SUCCESS (1 test run, 0 failures, 0 errors).

- [ ] **Step 5: Commit**

```powershell
git add pom.xml .gitignore src/
git commit -m "chore: scaffold Spring Boot 3 application and maven build configuration"
```

---

### Task 2: Core OOP Hierarchy & Custom Exception Framework

**Files:**
- Create: `src/main/java/com/smartledger/domain/UtilityType.java`
- Create: `src/main/java/com/smartledger/domain/BaseUtilityRecord.java`
- Create: `src/main/java/com/smartledger/exception/SmartLedgerException.java`
- Create: `src/main/java/com/smartledger/exception/InvalidMeterReadingException.java`
- Create: `src/main/java/com/smartledger/exception/InvalidDateRangeException.java`
- Create: `src/main/java/com/smartledger/exception/UtilityValidationException.java`
- Test: `src/test/java/com/smartledger/domain/BaseUtilityRecordTest.java`

**Interfaces:**
- Consumes: `UtilityType`
- Produces: `BaseUtilityRecord` abstract class with polymorphic contract: `getUtilityType()`, `validateRecord()`, `generateSummaryReport()`, and custom exception classes.

- [ ] **Step 1: Write the failing tests for BaseUtilityRecord and exceptions**

Create `src/test/java/com/smartledger/domain/BaseUtilityRecordTest.java`:
```java
package com.smartledger.domain;

import com.smartledger.exception.InvalidMeterReadingException;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class BaseUtilityRecordTest {

    // Concrete test subclass to verify polymorphic abstract methods
    static class DummyRecord extends BaseUtilityRecord {
        private final double reading;

        public DummyRecord(Long recordId, User user, LocalDate recordDate, Double totalAmount, double reading) {
            super(recordId, user, recordDate, totalAmount);
            this.reading = reading;
        }

        @Override
        public UtilityType getUtilityType() {
            return UtilityType.ELECTRICITY;
        }

        @Override
        public void validateRecord() {
            if (reading < 0) {
                throw new InvalidMeterReadingException("Meter reading cannot be negative: " + reading);
            }
        }

        @Override
        public String generateSummaryReport() {
            return "Utility: " + getUtilityType() + ", Cost: " + getTotalAmount();
        }
    }

    @Test
    void shouldCreateRecordAndGeneratePolymorphicSummary() {
        DummyRecord record = new DummyRecord(1L, null, LocalDate.of(2026, 9, 1), 150.0, 45.0);
        record.validateRecord();

        assertThat(record.getUtilityType()).isEqualTo(UtilityType.ELECTRICITY);
        assertThat(record.generateSummaryReport()).isEqualTo("Utility: ELECTRICITY, Cost: 150.0");
    }

    @Test
    void shouldThrowExceptionWhenReadingIsNegative() {
        DummyRecord record = new DummyRecord(1L, null, LocalDate.of(2026, 9, 1), 150.0, -10.0);

        assertThatThrownBy(record::validateRecord)
                .isInstanceOf(InvalidMeterReadingException.class)
                .hasMessageContaining("Meter reading cannot be negative");
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```powershell
mvn test -Dtest=BaseUtilityRecordTest
```
Expected: Compilation failure because types do not exist yet.

- [ ] **Step 3: Implement UtilityType, BaseUtilityRecord, and Exception Hierarchy**

Create `src/main/java/com/smartledger/domain/UtilityType.java`:
```java
package com.smartledger.domain;

public enum UtilityType {
    ELECTRICITY,
    GAS,
    TELECOM,
    TRANSPORT,
    GROCERY
}
```

Create `src/main/java/com/smartledger/exception/SmartLedgerException.java`:
```java
package com.smartledger.exception;

public class SmartLedgerException extends RuntimeException {
    public SmartLedgerException(String message) {
        super(message);
    }
    public SmartLedgerException(String message, Throwable cause) {
        super(message, cause);
    }
}
```

Create `src/main/java/com/smartledger/exception/InvalidMeterReadingException.java`:
```java
package com.smartledger.exception;

public class InvalidMeterReadingException extends SmartLedgerException {
    public InvalidMeterReadingException(String message) {
        super(message);
    }
}
```

Create `src/main/java/com/smartledger/exception/InvalidDateRangeException.java`:
```java
package com.smartledger.exception;

public class InvalidDateRangeException extends SmartLedgerException {
    public InvalidDateRangeException(String message) {
        super(message);
    }
}
```

Create `src/main/java/com/smartledger/exception/UtilityValidationException.java`:
```java
package com.smartledger.exception;

public class UtilityValidationException extends SmartLedgerException {
    public UtilityValidationException(String message) {
        super(message);
    }
}
```

Create `src/main/java/com/smartledger/domain/BaseUtilityRecord.java`:
```java
package com.smartledger.domain;

import jakarta.persistence.*;
import java.time.LocalDate;

@MappedSuperclass
public abstract class BaseUtilityRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long recordId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private LocalDate recordDate;

    @Column(nullable = false)
    private Double totalAmount;

    protected BaseUtilityRecord() {}

    protected BaseUtilityRecord(Long recordId, User user, LocalDate recordDate, Double totalAmount) {
        this.recordId = recordId;
        this.user = user;
        this.recordDate = recordDate;
        this.totalAmount = totalAmount;
    }

    public abstract UtilityType getUtilityType();
    public abstract void validateRecord();
    public abstract String generateSummaryReport();

    public Long getRecordId() { return recordId; }
    public void setRecordId(Long recordId) { this.recordId = recordId; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public LocalDate getRecordDate() { return recordDate; }
    public void setRecordDate(LocalDate recordDate) { this.recordDate = recordDate; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }
}
```

Create stub `src/main/java/com/smartledger/domain/User.java` to allow compilation:
```java
package com.smartledger.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    private LocalDateTime createdAt = LocalDateTime.now();

    public User() {}
    public User(String fullName, String email, String passwordHash) {
        this.fullName = fullName;
        this.email = email;
        this.passwordHash = passwordHash;
    }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```powershell
mvn test -Dtest=BaseUtilityRecordTest
```
Expected: PASS (2 tests run, 0 failures, 0 errors).

- [ ] **Step 5: Commit**

```powershell
git add src/main/java/com/smartledger/domain/ src/main/java/com/smartledger/exception/ src/test/java/com/smartledger/domain/
git commit -m "feat: implement BaseUtilityRecord abstract class, UtilityType enum, and custom exception hierarchy"
```

---

### Task 3: User Entity, BCrypt Authentication & UserService

**Files:**
- Create: `src/main/java/com/smartledger/repository/UserRepository.java`
- Create: `src/main/java/com/smartledger/service/UserService.java`
- Test: `src/test/java/com/smartledger/service/UserServiceTest.java`

**Interfaces:**
- Consumes: `User` entity, BCryptPasswordEncoder
- Produces: `UserService` with:
  - `User registerUser(String fullName, String email, String rawPassword)`
  - `Optional<User> authenticateUser(String email, String rawPassword)`
  - `Optional<User> findById(Long userId)`

- [ ] **Step 1: Write failing test for UserService**

Create `src/test/java/com/smartledger/service/UserServiceTest.java`:
```java
package com.smartledger.service;

import com.smartledger.domain.User;
import com.smartledger.exception.UtilityValidationException;
import com.smartledger.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    private UserService userService;
    private BCryptPasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        userService = new UserService(userRepository, passwordEncoder);
    }

    @Test
    void shouldRegisterNewUserWithHashedPassword() {
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setUserId(1L);
            return u;
        });

        User user = userService.registerUser("John Doe", "john@example.com", "Secret123!");

        assertThat(user.getUserId()).isEqualTo(1L);
        assertThat(user.getFullName()).isEqualTo("John Doe");
        assertThat(passwordEncoder.matches("Secret123!", user.getPasswordHash())).isTrue();
    }

    @Test
    void shouldRejectDuplicateEmailRegistration() {
        when(userRepository.findByEmail("existing@example.com")).thenReturn(Optional.of(new User()));

        assertThatThrownBy(() -> userService.registerUser("Jane", "existing@example.com", "pass"))
                .isInstanceOf(UtilityValidationException.class)
                .hasMessageContaining("Email already registered");
    }

    @Test
    void shouldAuthenticateValidCredentials() {
        String hash = passwordEncoder.encode("Secret123!");
        User user = new User("John", "john@example.com", hash);
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));

        Optional<User> result = userService.authenticateUser("john@example.com", "Secret123!");

        assertThat(result).isPresent();
        assertThat(result.get().getFullName()).isEqualTo("John");
    }

    @Test
    void shouldFailAuthenticationOnInvalidPassword() {
        String hash = passwordEncoder.encode("Secret123!");
        User user = new User("John", "john@example.com", hash);
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));

        Optional<User> result = userService.authenticateUser("john@example.com", "WrongPass");

        assertThat(result).isEmpty();
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```powershell
mvn test -Dtest=UserServiceTest
```
Expected: FAIL with missing classes/constructors.

- [ ] **Step 3: Implement UserRepository and UserService**

Create `src/main/java/com/smartledger/repository/UserRepository.java`:
```java
package com.smartledger.repository;

import com.smartledger.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
```

Create `src/main/java/com/smartledger/service/UserService.java`:
```java
package com.smartledger.service;

import com.smartledger.domain.User;
import com.smartledger.exception.UtilityValidationException;
import com.smartledger.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User registerUser(String fullName, String email, String rawPassword) {
        if (fullName == null || fullName.trim().isEmpty()) {
            throw new UtilityValidationException("Full name is required");
        }
        if (email == null || !email.contains("@")) {
            throw new UtilityValidationException("Valid email is required");
        }
        if (rawPassword == null || rawPassword.length() < 6) {
            throw new UtilityValidationException("Password must be at least 6 characters");
        }
        if (userRepository.findByEmail(email).isPresent()) {
            throw new UtilityValidationException("Email already registered: " + email);
        }

        String hashedPassword = passwordEncoder.encode(rawPassword);
        User user = new User(fullName.trim(), email.trim().toLowerCase(), hashedPassword);
        return userRepository.save(user);
    }

    public Optional<User> authenticateUser(String email, String rawPassword) {
        if (email == null || rawPassword == null) return Optional.empty();
        return userRepository.findByEmail(email.trim().toLowerCase())
                .filter(u -> passwordEncoder.matches(rawPassword, u.getPasswordHash()));
    }

    public Optional<User> findById(Long userId) {
        return userRepository.findById(userId);
    }
}
```

Create `src/main/java/com/smartledger/config/SecurityConfig.java`:
```java
package com.smartledger.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
public class SecurityConfig {

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```powershell
mvn test -Dtest=UserServiceTest
```
Expected: PASS (4 tests run, 0 failures, 0 errors).

- [ ] **Step 5: Commit**

```powershell
git add src/main/java/com/smartledger/repository/UserRepository.java src/main/java/com/smartledger/service/UserService.java src/main/java/com/smartledger/config/SecurityConfig.java src/test/java/com/smartledger/service/UserServiceTest.java
git commit -m "feat: implement UserRepository, BCrypt authentication and UserService with unit tests"
```

---

### Task 4: Electricity Domain Entity, Tariff Strategy Pattern & Fair-Split Calculation Engine (TDD)

**Files:**
- Create: `src/main/java/com/smartledger/domain/ElectricityRecord.java`
- Create: `src/main/java/com/smartledger/repository/ElectricityRecordRepository.java`
- Create: `src/main/java/com/smartledger/service/tariff/TariffCalculationStrategy.java`
- Create: `src/main/java/com/smartledger/service/tariff/ProgressiveSlabTariffStrategy.java`
- Create: `src/main/java/com/smartledger/service/tariff/CommercialFlatTariffStrategy.java`
- Create: `src/main/java/com/smartledger/dto/SubMeterShareResult.java`
- Create: `src/main/java/com/smartledger/service/ElectricityCalculationEngine.java`
- Create: `src/main/java/com/smartledger/service/ElectricityService.java`
- Test: `src/test/java/com/smartledger/service/ElectricityCalculationEngineTest.java`

**Interfaces:**
- Consumes: `TariffCalculationStrategy`
- Produces:
  - `SubMeterShareResult calculateShare(double masterUnits, double myUnits, double otherUnits)`
  - `ElectricityService.recordReading(...)`

- [ ] **Step 1: Write failing tests for Tariff Strategy and Electricity Fair-Split Engine**

Create `src/test/java/com/smartledger/service/ElectricityCalculationEngineTest.java`:
```java
package com.smartledger.service;

import com.smartledger.dto.SubMeterShareResult;
import com.smartledger.exception.InvalidMeterReadingException;
import com.smartledger.service.tariff.ProgressiveSlabTariffStrategy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.within;

class ElectricityCalculationEngineTest {

    private ElectricityCalculationEngine calculationEngine;
    private ProgressiveSlabTariffStrategy tariffStrategy;

    @BeforeEach
    void setUp() {
        tariffStrategy = new ProgressiveSlabTariffStrategy();
        calculationEngine = new ElectricityCalculationEngine(tariffStrategy);
    }

    @Test
    void shouldCalculateTotalMasterBillUnderProgressiveSlabs() {
        // Slab: 0-100 free, 101-200 @ 2.25, 201-500 @ 4.50, >500 @ 6.00 + 50.0 fixed
        // For 350 units: 100*0 + 100*2.25 (225) + 150*4.50 (675) + 50 fixed = 950.0
        double totalBill = tariffStrategy.calculateMasterBill(350.0);
        assertThat(totalBill).isCloseTo(950.0, within(0.01));
    }

    @Test
    void shouldCalculateFairSplitProportionalToSubMeters() {
        // Master = 350 units (total bill 950.0)
        // Tenant A (myUnits) = 140, Tenant B (otherUnits) = 210. Total submeter = 350.
        // My ratio = 140 / 350 = 0.40 -> Share = 950.0 * 0.40 = 380.0
        SubMeterShareResult result = calculationEngine.calculateShare(350.0, 140.0, 210.0);

        assertThat(result.masterUnits()).isEqualTo(350.0);
        assertThat(result.totalSubUnits()).isEqualTo(350.0);
        assertThat(result.myUnits()).isEqualTo(140.0);
        assertThat(result.totalEbBill()).isCloseTo(950.0, within(0.01));
        assertThat(result.calculatedMyShare()).isCloseTo(380.0, within(0.01));
        assertThat(result.effectiveRatePerUnit()).isCloseTo(380.0 / 140.0, within(0.01));
    }

    @Test
    void shouldHandleZeroSubMeterUnitsWithoutDivideByZero() {
        SubMeterShareResult result = calculationEngine.calculateShare(100.0, 0.0, 0.0);

        assertThat(result.calculatedMyShare()).isEqualTo(0.0);
        assertThat(result.effectiveRatePerUnit()).isEqualTo(0.0);
    }

    @Test
    void shouldRejectNegativeMeterReadings() {
        assertThatThrownBy(() -> calculationEngine.calculateShare(200.0, -10.0, 50.0))
                .isInstanceOf(InvalidMeterReadingException.class)
                .hasMessageContaining("cannot be negative");
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```powershell
mvn test -Dtest=ElectricityCalculationEngineTest
```
Expected: FAIL (missing classes).

- [ ] **Step 3: Implement Tariff strategies, DTOs, Calculation Engine, and Domain Entity**

Create `src/main/java/com/smartledger/service/tariff/TariffCalculationStrategy.java`:
```java
package com.smartledger.service.tariff;

public interface TariffCalculationStrategy {
    double calculateMasterBill(double totalUnits);
    String getStrategyName();
}
```

Create `src/main/java/com/smartledger/service/tariff/ProgressiveSlabTariffStrategy.java`:
```java
package com.smartledger.service.tariff;

import org.springframework.stereotype.Component;

@Component
public class ProgressiveSlabTariffStrategy implements TariffCalculationStrategy {

    private static final double FIXED_CHARGE = 50.0;

    @Override
    public double calculateMasterBill(double totalUnits) {
        if (totalUnits <= 0) return FIXED_CHARGE;

        double bill = FIXED_CHARGE;
        double remaining = totalUnits;

        // Tier 1: 0 - 100 units @ 0.0
        double tier1 = Math.min(remaining, 100.0);
        remaining -= tier1;

        // Tier 2: 101 - 200 units @ 2.25
        if (remaining > 0) {
            double tier2 = Math.min(remaining, 100.0);
            bill += tier2 * 2.25;
            remaining -= tier2;
        }

        // Tier 3: 201 - 500 units @ 4.50
        if (remaining > 0) {
            double tier3 = Math.min(remaining, 300.0);
            bill += tier3 * 4.50;
            remaining -= tier3;
        }

        // Tier 4: > 500 units @ 6.00
        if (remaining > 0) {
            bill += remaining * 6.00;
        }

        return bill;
    }

    @Override
    public String getStrategyName() {
        return "Progressive Domestic Slab (TNEB Model)";
    }
}
```

Create `src/main/java/com/smartledger/service/tariff/CommercialFlatTariffStrategy.java`:
```java
package com.smartledger.service.tariff;

import org.springframework.stereotype.Component;

@Component
public class CommercialFlatTariffStrategy implements TariffCalculationStrategy {
    private static final double FLAT_RATE = 7.50;
    private static final double FIXED_CHARGE = 100.0;

    @Override
    public double calculateMasterBill(double totalUnits) {
        if (totalUnits <= 0) return FIXED_CHARGE;
        return (totalUnits * FLAT_RATE) + FIXED_CHARGE;
    }

    @Override
    public String getStrategyName() {
        return "Commercial Flat Tariff (₹7.50/unit)";
    }
}
```

Create `src/main/java/com/smartledger/dto/SubMeterShareResult.java`:
```java
package com.smartledger.dto;

public record SubMeterShareResult(
        double masterUnits,
        double totalSubUnits,
        double myUnits,
        double otherUnits,
        double totalEbBill,
        double calculatedMyShare,
        double effectiveRatePerUnit,
        boolean isShared
) {}
```

Create `src/main/java/com/smartledger/service/ElectricityCalculationEngine.java`:
```java
package com.smartledger.service;

import com.smartledger.dto.SubMeterShareResult;
import com.smartledger.exception.InvalidMeterReadingException;
import com.smartledger.service.tariff.TariffCalculationStrategy;
import org.springframework.stereotype.Service;

@Service
public class ElectricityCalculationEngine {

    private final TariffCalculationStrategy tariffStrategy;

    public ElectricityCalculationEngine(TariffCalculationStrategy tariffStrategy) {
        this.tariffStrategy = tariffStrategy;
    }

    public SubMeterShareResult calculateShare(double masterUnits, double myUnits, double otherUnits) {
        if (masterUnits < 0 || myUnits < 0 || otherUnits < 0) {
            throw new InvalidMeterReadingException("Meter readings cannot be negative. Supplied: master="
                    + masterUnits + ", myUnits=" + myUnits + ", otherUnits=" + otherUnits);
        }

        double totalEbBill = tariffStrategy.calculateMasterBill(masterUnits);
        double totalSubUnits = myUnits + otherUnits;
        boolean isShared = otherUnits > 0;

        if (totalSubUnits == 0) {
            return new SubMeterShareResult(masterUnits, 0.0, myUnits, otherUnits, totalEbBill, 0.0, 0.0, isShared);
        }

        double userRatio = myUnits / totalSubUnits;
        double calculatedMyShare = totalEbBill * userRatio;
        double effectiveRate = (myUnits > 0) ? (calculatedMyShare / myUnits) : 0.0;

        return new SubMeterShareResult(
                masterUnits,
                totalSubUnits,
                myUnits,
                otherUnits,
                totalEbBill,
                calculatedMyShare,
                effectiveRate,
                isShared
        );
    }
}
```

Create `src/main/java/com/smartledger/domain/ElectricityRecord.java`:
```java
package com.smartledger.domain;

import com.smartledger.exception.InvalidMeterReadingException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.time.LocalDate;

@Entity
@Table(name = "electricity_records")
public class ElectricityRecord extends BaseUtilityRecord {

    @Column(nullable = false, length = 7)
    private String billingMonth; // YYYY-MM

    @Column(nullable = false)
    private Double masterEbUnits;

    @Column(nullable = false)
    private Double totalEbAmount;

    private Boolean isShared = false;

    @Column(nullable = false)
    private Double mySubmeterUnits;

    private Double otherSubmeterUnits = 0.0;

    @Column(nullable = false)
    private Double calculatedMyShare;

    private LocalDate paidDate;

    public ElectricityRecord() {}

    public ElectricityRecord(User user, String billingMonth, Double masterEbUnits, Double totalEbAmount,
                             Boolean isShared, Double mySubmeterUnits, Double otherSubmeterUnits,
                             Double calculatedMyShare, LocalDate paidDate) {
        super(null, user, paidDate != null ? paidDate : LocalDate.now(), calculatedMyShare);
        this.billingMonth = billingMonth;
        this.masterEbUnits = masterEbUnits;
        this.totalEbAmount = totalEbAmount;
        this.isShared = isShared;
        this.mySubmeterUnits = mySubmeterUnits;
        this.otherSubmeterUnits = otherSubmeterUnits != null ? otherSubmeterUnits : 0.0;
        this.calculatedMyShare = calculatedMyShare;
        this.paidDate = paidDate;
    }

    @Override
    public UtilityType getUtilityType() {
        return UtilityType.ELECTRICITY;
    }

    @Override
    public void validateRecord() {
        if (masterEbUnits < 0 || mySubmeterUnits < 0 || otherSubmeterUnits < 0) {
            throw new InvalidMeterReadingException("Electricity meter units cannot be negative");
        }
    }

    @Override
    public String generateSummaryReport() {
        return String.format("Electricity [%s]: Master=%.1fkWh, My Share=₹%.2f (Effective ₹%.2f/unit)",
                billingMonth, masterEbUnits, calculatedMyShare,
                (mySubmeterUnits > 0 ? calculatedMyShare / mySubmeterUnits : 0.0));
    }

    // Getters and Setters
    public String getBillingMonth() { return billingMonth; }
    public void setBillingMonth(String billingMonth) { this.billingMonth = billingMonth; }
    public Double getMasterEbUnits() { return masterEbUnits; }
    public void setMasterEbUnits(Double masterEbUnits) { this.masterEbUnits = masterEbUnits; }
    public Double getTotalEbAmount() { return totalEbAmount; }
    public void setTotalEbAmount(Double totalEbAmount) { this.totalEbAmount = totalEbAmount; }
    public Boolean getIsShared() { return isShared; }
    public void setIsShared(Boolean shared) { isShared = shared; }
    public Double getMySubmeterUnits() { return mySubmeterUnits; }
    public void setMySubmeterUnits(Double mySubmeterUnits) { this.mySubmeterUnits = mySubmeterUnits; }
    public Double getOtherSubmeterUnits() { return otherSubmeterUnits; }
    public void setOtherSubmeterUnits(Double otherSubmeterUnits) { this.otherSubmeterUnits = otherSubmeterUnits; }
    public Double getCalculatedMyShare() { return calculatedMyShare; }
    public void setCalculatedMyShare(Double calculatedMyShare) { this.calculatedMyShare = calculatedMyShare; }
    public LocalDate getPaidDate() { return paidDate; }
    public void setPaidDate(LocalDate paidDate) { this.paidDate = paidDate; }
}
```

Create `src/main/java/com/smartledger/repository/ElectricityRecordRepository.java`:
```java
package com.smartledger.repository;

import com.smartledger.domain.ElectricityRecord;
import com.smartledger.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ElectricityRecordRepository extends JpaRepository<ElectricityRecord, Long> {
    List<ElectricityRecord> findByUserOrderByBillingMonthDesc(User user);
}
```

Create `src/main/java/com/smartledger/service/ElectricityService.java`:
```java
package com.smartledger.service;

import com.smartledger.domain.ElectricityRecord;
import com.smartledger.domain.User;
import com.smartledger.dto.SubMeterShareResult;
import com.smartledger.repository.ElectricityRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class ElectricityService {

    private final ElectricityRecordRepository repository;
    private final ElectricityCalculationEngine calculationEngine;

    public ElectricityService(ElectricityRecordRepository repository, ElectricityCalculationEngine calculationEngine) {
        this.repository = repository;
        this.calculationEngine = calculationEngine;
    }

    @Transactional
    public ElectricityRecord addRecord(User user, String billingMonth, double masterUnits, double myUnits,
                                      double otherUnits, LocalDate paidDate) {
        SubMeterShareResult share = calculationEngine.calculateShare(masterUnits, myUnits, otherUnits);
        ElectricityRecord record = new ElectricityRecord(
                user,
                billingMonth,
                masterUnits,
                share.totalEbBill(),
                share.isShared(),
                myUnits,
                otherUnits,
                share.calculatedMyShare(),
                paidDate != null ? paidDate : LocalDate.now()
        );
        record.validateRecord();
        return repository.save(record);
    }

    public List<ElectricityRecord> getRecordsForUser(User user) {
        return repository.findByUserOrderByBillingMonthDesc(user);
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```powershell
mvn test -Dtest=ElectricityCalculationEngineTest
```
Expected: PASS (4 tests run, 0 failures, 0 errors).

- [ ] **Step 5: Commit**

```powershell
git add src/main/java/com/smartledger/domain/ElectricityRecord.java src/main/java/com/smartledger/repository/ElectricityRecordRepository.java src/main/java/com/smartledger/service/tariff/ src/main/java/com/smartledger/dto/SubMeterShareResult.java src/main/java/com/smartledger/service/ElectricityCalculationEngine.java src/main/java/com/smartledger/service/ElectricityService.java src/test/java/com/smartledger/service/ElectricityCalculationEngineTest.java
git commit -m "feat: implement electricity fair-split algorithm, tariff strategy pattern, and entity with unit tests"
```

---

### Task 5: Gas Domain Entity & LPG Burn-Rate Depletion Forecast Engine (TDD)

**Files:**
- Create: `src/main/java/com/smartledger/domain/GasRecord.java`
- Create: `src/main/java/com/smartledger/repository/GasRecordRepository.java`
- Create: `src/main/java/com/smartledger/dto/DepletionForecast.java`
- Create: `src/main/java/com/smartledger/service/GasDepletionEngine.java`
- Create: `src/main/java/com/smartledger/service/GasService.java`
- Test: `src/test/java/com/smartledger/service/GasDepletionEngineTest.java`

**Interfaces:**
- Consumes: `GasRecord`, `java.time.LocalDate`, `ChronoUnit.DAYS`
- Produces: `DepletionForecast calculateDepletionForecast(GasRecord activeCylinder, List<GasRecord> pastCylinders, LocalDate currentDate)`

- [ ] **Step 1: Write failing tests for Gas Depletion Engine**

Create `src/test/java/com/smartledger/service/GasDepletionEngineTest.java`:
```java
package com.smartledger.service;

import com.smartledger.domain.GasRecord;
import com.smartledger.dto.DepletionForecast;
import com.smartledger.exception.InvalidDateRangeException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.within;

class GasDepletionEngineTest {

    private GasDepletionEngine depletionEngine;

    @BeforeEach
    void setUp() {
        depletionEngine = new GasDepletionEngine();
    }

    @Test
    void shouldComputeBurnRateAndForecastRunOutDateWithHistory() {
        // Past cylinder 1: 14.2kg, lasted 35 days (14.2 / 35 = ~0.4057 kg/day)
        GasRecord past1 = new GasRecord(null, 14.2, 850.0,
                LocalDate.of(2026, 6, 1), LocalDate.of(2026, 7, 6), false);

        // Active cylinder connected on 2026-08-01, current date 2026-08-25
        GasRecord active = new GasRecord(null, 14.2, 850.0,
                LocalDate.of(2026, 8, 1), null, true);

        LocalDate today = LocalDate.of(2026, 8, 25); // 24 days in

        DepletionForecast forecast = depletionEngine.calculateForecast(active, List.of(past1), today);

        assertThat(forecast.burnRateKgPerDay()).isCloseTo(14.2 / 35.0, within(0.01));
        assertThat(forecast.predictedDepletionDate()).isEqualTo(LocalDate.of(2026, 8, 1).plusDays(35));
        assertThat(forecast.daysRemaining()).isEqualTo(11); // 35 - 24
        assertThat(forecast.refillAlert()).isFalse();
    }

    @Test
    void shouldTriggerRefillAlertWhenFiveOrFewerDaysRemaining() {
        GasRecord active = new GasRecord(null, 14.2, 850.0,
                LocalDate.of(2026, 8, 1), null, true);

        // Today is 32 days in (predicted duration = 32 days baseline for 14.2 / 0.45 = ~32 days)
        LocalDate today = LocalDate.of(2026, 8, 30); // 29 days in

        DepletionForecast forecast = depletionEngine.calculateForecast(active, List.of(), today);

        assertThat(forecast.daysRemaining()).isLessThanOrEqualTo(5);
        assertThat(forecast.refillAlert()).isTrue();
    }

    @Test
    void shouldFallbackToDomesticBaselineWhenNoHistoryProvided() {
        GasRecord active = new GasRecord(null, 14.2, 850.0,
                LocalDate.of(2026, 9, 1), null, true);

        DepletionForecast forecast = depletionEngine.calculateForecast(active, List.of(), LocalDate.of(2026, 9, 2));

        assertThat(forecast.burnRateKgPerDay()).isCloseTo(0.45, within(0.01));
    }

    @Test
    void shouldRejectFinishedDateBeforeConnectedDate() {
        GasRecord invalid = new GasRecord(null, 14.2, 850.0,
                LocalDate.of(2026, 9, 10), LocalDate.of(2026, 9, 1), false);

        assertThatThrownBy(invalid::validateRecord)
                .isInstanceOf(InvalidDateRangeException.class)
                .hasMessageContaining("cannot be before");
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```powershell
mvn test -Dtest=GasDepletionEngineTest
```
Expected: FAIL (missing classes).

- [ ] **Step 3: Implement GasRecord, DTO, and GasDepletionEngine**

Create `src/main/java/com/smartledger/domain/GasRecord.java`:
```java
package com.smartledger.domain;

import com.smartledger.exception.InvalidDateRangeException;
import com.smartledger.exception.UtilityValidationException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Entity
@Table(name = "gas_records")
public class GasRecord extends BaseUtilityRecord {

    @Column(nullable = false)
    private Double cylinderWeightKg = 14.2;

    @Column(nullable = false)
    private Double bookingCost;

    @Column(nullable = false)
    private LocalDate connectedDate;

    private LocalDate finishedDate;

    private Double burnRatePerDay;

    private Boolean isActive = true;

    public GasRecord() {}

    public GasRecord(User user, Double cylinderWeightKg, Double bookingCost,
                     LocalDate connectedDate, LocalDate finishedDate, Boolean isActive) {
        super(null, user, connectedDate != null ? connectedDate : LocalDate.now(), bookingCost);
        this.cylinderWeightKg = cylinderWeightKg != null ? cylinderWeightKg : 14.2;
        this.bookingCost = bookingCost;
        this.connectedDate = connectedDate;
        this.finishedDate = finishedDate;
        this.isActive = isActive != null ? isActive : true;
        if (finishedDate != null && connectedDate != null) {
            long days = ChronoUnit.DAYS.between(connectedDate, finishedDate);
            if (days > 0) {
                this.burnRatePerDay = this.cylinderWeightKg / days;
            }
        }
    }

    @Override
    public UtilityType getUtilityType() {
        return UtilityType.GAS;
    }

    @Override
    public void validateRecord() {
        if (cylinderWeightKg == null || cylinderWeightKg <= 0) {
            throw new UtilityValidationException("Cylinder weight must be greater than 0");
        }
        if (connectedDate == null) {
            throw new UtilityValidationException("Connected date is required");
        }
        if (finishedDate != null && finishedDate.isBefore(connectedDate)) {
            throw new InvalidDateRangeException("Finished date (" + finishedDate + ") cannot be before connected date (" + connectedDate + ")");
        }
    }

    @Override
    public String generateSummaryReport() {
        return String.format("LPG Cylinder: %.1fkg, Status: %s, Burn Rate: %s",
                cylinderWeightKg, isActive ? "ACTIVE" : "COMPLETED",
                burnRatePerDay != null ? String.format("%.3f kg/day", burnRatePerDay) : "N/A");
    }

    // Getters and Setters
    public Double getCylinderWeightKg() { return cylinderWeightKg; }
    public void setCylinderWeightKg(Double cylinderWeightKg) { this.cylinderWeightKg = cylinderWeightKg; }
    public Double getBookingCost() { return bookingCost; }
    public void setBookingCost(Double bookingCost) { this.bookingCost = bookingCost; }
    public LocalDate getConnectedDate() { return connectedDate; }
    public void setConnectedDate(LocalDate connectedDate) { this.connectedDate = connectedDate; }
    public LocalDate getFinishedDate() { return finishedDate; }
    public void setFinishedDate(LocalDate finishedDate) { this.finishedDate = finishedDate; }
    public Double getBurnRatePerDay() { return burnRatePerDay; }
    public void setBurnRatePerDay(Double burnRatePerDay) { this.burnRatePerDay = burnRatePerDay; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean active) { isActive = active; }
}
```

Create `src/main/java/com/smartledger/dto/DepletionForecast.java`:
```java
package com.smartledger.dto;

import java.time.LocalDate;

public record DepletionForecast(
        LocalDate connectedDate,
        double cylinderWeightKg,
        double burnRateKgPerDay,
        LocalDate predictedDepletionDate,
        long daysRemaining,
        double percentageRemaining,
        boolean refillAlert
) {}
```

Create `src/main/java/com/smartledger/service/GasDepletionEngine.java`:
```java
package com.smartledger.service;

import com.smartledger.domain.GasRecord;
import com.smartledger.dto.DepletionForecast;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class GasDepletionEngine {

    public static final double DEFAULT_BASELINE_BURN_RATE = 0.45; // kg/day domestic standard

    public DepletionForecast calculateForecast(GasRecord activeCylinder, List<GasRecord> pastCylinders, LocalDate currentDate) {
        double weight = activeCylinder.getCylinderWeightKg() != null ? activeCylinder.getCylinderWeightKg() : 14.2;
        LocalDate connected = activeCylinder.getConnectedDate() != null ? activeCylinder.getConnectedDate() : currentDate;

        double burnRate = pastCylinders.stream()
                .filter(c -> c.getBurnRatePerDay() != null && c.getBurnRatePerDay() > 0)
                .mapToDouble(GasRecord::getBurnRatePerDay)
                .average()
                .orElse(DEFAULT_BASELINE_BURN_RATE);

        long totalEstimatedDays = Math.max(1, Math.round(weight / burnRate));
        LocalDate predictedDepletion = connected.plusDays(totalEstimatedDays);

        long daysElapsed = Math.max(0, ChronoUnit.DAYS.between(connected, currentDate));
        long daysRemaining = Math.max(0, totalEstimatedDays - daysElapsed);

        double pctRemaining = Math.max(0.0, Math.min(100.0, ((double) daysRemaining / totalEstimatedDays) * 100.0));
        boolean refillAlert = daysRemaining <= 5;

        return new DepletionForecast(connected, weight, burnRate, predictedDepletion, daysRemaining, pctRemaining, refillAlert);
    }
}
```

Create `src/main/java/com/smartledger/repository/GasRecordRepository.java`:
```java
package com.smartledger.repository;

import com.smartledger.domain.GasRecord;
import com.smartledger.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GasRecordRepository extends JpaRepository<GasRecord, Long> {
    List<GasRecord> findByUserOrderByConnectedDateDesc(User user);
    Optional<GasRecord> findByUserAndIsActiveTrue(User user);
}
```

Create `src/main/java/com/smartledger/service/GasService.java`:
```java
package com.smartledger.service;

import com.smartledger.domain.GasRecord;
import com.smartledger.domain.User;
import com.smartledger.dto.DepletionForecast;
import com.smartledger.repository.GasRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class GasService {

    private final GasRecordRepository repository;
    private final GasDepletionEngine depletionEngine;

    public GasService(GasRecordRepository repository, GasDepletionEngine depletionEngine) {
        this.repository = repository;
        this.depletionEngine = depletionEngine;
    }

    @Transactional
    public GasRecord connectNewCylinder(User user, double weightKg, double bookingCost, LocalDate connectedDate) {
        // Mark any currently active cylinder as finished
        repository.findByUserAndIsActiveTrue(user).ifPresent(curr -> {
            curr.setIsActive(false);
            curr.setFinishedDate(connectedDate != null ? connectedDate : LocalDate.now());
            curr.validateRecord();
            repository.save(curr);
        });

        GasRecord newCylinder = new GasRecord(user, weightKg, bookingCost, connectedDate, null, true);
        newCylinder.validateRecord();
        return repository.save(newCylinder);
    }

    public Optional<DepletionForecast> getActiveForecast(User user) {
        Optional<GasRecord> active = repository.findByUserAndIsActiveTrue(user);
        if (active.isEmpty()) return Optional.empty();

        List<GasRecord> past = repository.findByUserOrderByConnectedDateDesc(user).stream()
                .filter(c -> !Boolean.TRUE.equals(c.getIsActive()))
                .toList();

        return Optional.of(depletionEngine.calculateForecast(active.get(), past, LocalDate.now()));
    }

    public List<GasRecord> getAllForUser(User user) {
        return repository.findByUserOrderByConnectedDateDesc(user);
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```powershell
mvn test -Dtest=GasDepletionEngineTest
```
Expected: PASS (4 tests run, 0 failures, 0 errors).

- [ ] **Step 5: Commit**

```powershell
git add src/main/java/com/smartledger/domain/GasRecord.java src/main/java/com/smartledger/dto/DepletionForecast.java src/main/java/com/smartledger/service/GasDepletionEngine.java src/main/java/com/smartledger/repository/GasRecordRepository.java src/main/java/com/smartledger/service/GasService.java src/test/java/com/smartledger/service/GasDepletionEngineTest.java
git commit -m "feat: implement LPG gas burn-rate and depletion predictor with unit tests"
```

---

### Task 6: Telecom Domain Entity & Multi-Member Expiry Countdown Matrix (TDD)

**Files:**
- Create: `src/main/java/com/smartledger/domain/TelecomRecord.java`
- Create: `src/main/java/com/smartledger/dto/TelecomStatus.java`
- Create: `src/main/java/com/smartledger/dto/TelecomCountdownDto.java`
- Create: `src/main/java/com/smartledger/service/TelecomMatrixEngine.java`
- Create: `src/main/java/com/smartledger/repository/TelecomRecordRepository.java`
- Create: `src/main/java/com/smartledger/service/TelecomService.java`
- Test: `src/test/java/com/smartledger/service/TelecomMatrixEngineTest.java`

**Interfaces:**
- Consumes: `TelecomRecord`, `LocalDate`
- Produces: `TelecomCountdownDto evaluateCountdown(TelecomRecord record, LocalDate currentDate)`

- [ ] **Step 1: Write failing tests for Telecom Countdown Matrix Engine**

Create `src/test/java/com/smartledger/service/TelecomMatrixEngineTest.java`:
```java
package com.smartledger.service;

import com.smartledger.domain.TelecomRecord;
import com.smartledger.dto.TelecomCountdownDto;
import com.smartledger.dto.TelecomStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class TelecomMatrixEngineTest {

    private TelecomMatrixEngine engine;

    @BeforeEach
    void setUp() {
        engine = new TelecomMatrixEngine();
    }

    @Test
    void shouldEvaluateActivePlanWithGreenStatus() {
        // Plan recharged 2026-09-01 with 84 days validity -> expires 2026-11-24
        TelecomRecord record = new TelecomRecord(null, "Mom", "Jio", 719.0,
                LocalDate.of(2026, 9, 1), 84, LocalDate.of(2026, 11, 24));

        LocalDate today = LocalDate.of(2026, 9, 22); // 63 days remaining
        TelecomCountdownDto dto = engine.evaluateCountdown(record, today);

        assertThat(dto.daysRemaining()).isEqualTo(63);
        assertThat(dto.status()).isEqualTo(TelecomStatus.ACTIVE);
    }

    @Test
    void shouldEvaluateExpiringSoonWhenWithinThreeDays() {
        TelecomRecord record = new TelecomRecord(null, "Dad", "Airtel", 299.0,
                LocalDate.of(2026, 8, 25), 28, LocalDate.of(2026, 9, 22));

        LocalDate today = LocalDate.of(2026, 9, 20); // 2 days remaining
        TelecomCountdownDto dto = engine.evaluateCountdown(record, today);

        assertThat(dto.daysRemaining()).isEqualTo(2);
        assertThat(dto.status()).isEqualTo(TelecomStatus.EXPIRING_SOON);
    }

    @Test
    void shouldEvaluateExpiredBlackoutWhenPastExpiry() {
        TelecomRecord record = new TelecomRecord(null, "Self", "BSNL", 199.0,
                LocalDate.of(2026, 8, 01), 30, LocalDate.of(2026, 8, 31));

        LocalDate today = LocalDate.of(2026, 9, 22); // -22 days
        TelecomCountdownDto dto = engine.evaluateCountdown(record, today);

        assertThat(dto.daysRemaining()).isLessThan(0);
        assertThat(dto.status()).isEqualTo(TelecomStatus.EXPIRED_BLACKOUT);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```powershell
mvn test -Dtest=TelecomMatrixEngineTest
```
Expected: FAIL (missing classes).

- [ ] **Step 3: Implement TelecomRecord, Enums, DTOs, and TelecomMatrixEngine**

Create `src/main/java/com/smartledger/dto/TelecomStatus.java`:
```java
package com.smartledger.dto;

public enum TelecomStatus {
    ACTIVE,
    EXPIRING_SOON,
    EXPIRED_BLACKOUT
}
```

Create `src/main/java/com/smartledger/dto/TelecomCountdownDto.java`:
```java
package com.smartledger.dto;

import java.time.LocalDate;

public record TelecomCountdownDto(
        Long rechargeId,
        String familyMemberName,
        String serviceProvider,
        double planAmount,
        LocalDate rechargeDate,
        int validityDays,
        LocalDate expiryDate,
        long daysRemaining,
        TelecomStatus status
) {}
```

Create `src/main/java/com/smartledger/domain/TelecomRecord.java`:
```java
package com.smartledger.domain;

import com.smartledger.exception.UtilityValidationException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.time.LocalDate;

@Entity
@Table(name = "telecom_records")
public class TelecomRecord extends BaseUtilityRecord {

    @Column(nullable = false, length = 100)
    private String familyMemberName;

    @Column(nullable = false, length = 50)
    private String serviceProvider;

    @Column(nullable = false)
    private Double planAmount;

    @Column(nullable = false)
    private LocalDate rechargeDate;

    @Column(nullable = false)
    private Integer validityDays;

    @Column(nullable = false)
    private LocalDate expiryDate;

    public TelecomRecord() {}

    public TelecomRecord(User user, String familyMemberName, String serviceProvider, Double planAmount,
                         LocalDate rechargeDate, Integer validityDays, LocalDate expiryDate) {
        super(null, user, rechargeDate != null ? rechargeDate : LocalDate.now(), planAmount);
        this.familyMemberName = familyMemberName;
        this.serviceProvider = serviceProvider;
        this.planAmount = planAmount;
        this.rechargeDate = rechargeDate;
        this.validityDays = validityDays;
        this.expiryDate = expiryDate != null ? expiryDate : (rechargeDate != null ? rechargeDate.plusDays(validityDays) : null);
    }

    @Override
    public UtilityType getUtilityType() {
        return UtilityType.TELECOM;
    }

    @Override
    public void validateRecord() {
        if (familyMemberName == null || familyMemberName.trim().isEmpty()) {
            throw new UtilityValidationException("Family member name is required");
        }
        if (serviceProvider == null || serviceProvider.trim().isEmpty()) {
            throw new UtilityValidationException("Service provider is required");
        }
        if (planAmount == null || planAmount <= 0) {
            throw new UtilityValidationException("Plan amount must be positive");
        }
        if (validityDays == null || validityDays <= 0) {
            throw new UtilityValidationException("Validity days must be greater than 0");
        }
    }

    @Override
    public String generateSummaryReport() {
        return String.format("Telecom [%s - %s]: ₹%.2f, Expires on %s",
                familyMemberName, serviceProvider, planAmount, expiryDate);
    }

    // Getters and Setters
    public String getFamilyMemberName() { return familyMemberName; }
    public void setFamilyMemberName(String familyMemberName) { this.familyMemberName = familyMemberName; }
    public String getServiceProvider() { return serviceProvider; }
    public void setServiceProvider(String serviceProvider) { this.serviceProvider = serviceProvider; }
    public Double getPlanAmount() { return planAmount; }
    public void setPlanAmount(Double planAmount) { this.planAmount = planAmount; }
    public LocalDate getRechargeDate() { return rechargeDate; }
    public void setRechargeDate(LocalDate rechargeDate) { this.rechargeDate = rechargeDate; }
    public Integer getValidityDays() { return validityDays; }
    public void setValidityDays(Integer validityDays) { this.validityDays = validityDays; }
    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }
}
```

Create `src/main/java/com/smartledger/service/TelecomMatrixEngine.java`:
```java
package com.smartledger.service;

import com.smartledger.domain.TelecomRecord;
import com.smartledger.dto.TelecomCountdownDto;
import com.smartledger.dto.TelecomStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Service
public class TelecomMatrixEngine {

    public TelecomCountdownDto evaluateCountdown(TelecomRecord record, LocalDate currentDate) {
        LocalDate expiry = record.getExpiryDate() != null ? record.getExpiryDate() : record.getRechargeDate().plusDays(record.getValidityDays());
        long daysRemaining = ChronoUnit.DAYS.between(currentDate, expiry);

        TelecomStatus status;
        if (daysRemaining < 0) {
            status = TelecomStatus.EXPIRED_BLACKOUT;
        } else if (daysRemaining <= 3) {
            status = TelecomStatus.EXPIRING_SOON;
        } else {
            status = TelecomStatus.ACTIVE;
        }

        return new TelecomCountdownDto(
                record.getRecordId(),
                record.getFamilyMemberName(),
                record.getServiceProvider(),
                record.getPlanAmount() != null ? record.getPlanAmount() : 0.0,
                record.getRechargeDate(),
                record.getValidityDays() != null ? record.getValidityDays() : 0,
                expiry,
                daysRemaining,
                status
        );
    }
}
```

Create `src/main/java/com/smartledger/repository/TelecomRecordRepository.java`:
```java
package com.smartledger.repository;

import com.smartledger.domain.TelecomRecord;
import com.smartledger.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TelecomRecordRepository extends JpaRepository<TelecomRecord, Long> {
    List<TelecomRecord> findByUserOrderByExpiryDateAsc(User user);
}
```

Create `src/main/java/com/smartledger/service/TelecomService.java`:
```java
package com.smartledger.service;

import com.smartledger.domain.TelecomRecord;
import com.smartledger.domain.User;
import com.smartledger.dto.TelecomCountdownDto;
import com.smartledger.repository.TelecomRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class TelecomService {

    private final TelecomRecordRepository repository;
    private final TelecomMatrixEngine matrixEngine;

    public TelecomService(TelecomRecordRepository repository, TelecomMatrixEngine matrixEngine) {
        this.repository = repository;
        this.matrixEngine = matrixEngine;
    }

    @Transactional
    public TelecomRecord addRecharge(User user, String memberName, String provider, double amount,
                                     LocalDate rechargeDate, int validityDays) {
        LocalDate expiry = (rechargeDate != null ? rechargeDate : LocalDate.now()).plusDays(validityDays);
        TelecomRecord record = new TelecomRecord(user, memberName, provider, amount, rechargeDate, validityDays, expiry);
        record.validateRecord();
        return repository.save(record);
    }

    public List<TelecomCountdownDto> getCountdownMatrix(User user) {
        LocalDate today = LocalDate.now();
        return repository.findByUserOrderByExpiryDateAsc(user).stream()
                .map(r -> matrixEngine.evaluateCountdown(r, today))
                .toList();
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```powershell
mvn test -Dtest=TelecomMatrixEngineTest
```
Expected: PASS (3 tests run, 0 failures, 0 errors).

- [ ] **Step 5: Commit**

```powershell
git add src/main/java/com/smartledger/domain/TelecomRecord.java src/main/java/com/smartledger/dto/TelecomStatus.java src/main/java/com/smartledger/dto/TelecomCountdownDto.java src/main/java/com/smartledger/service/TelecomMatrixEngine.java src/main/java/com/smartledger/repository/TelecomRecordRepository.java src/main/java/com/smartledger/service/TelecomService.java src/test/java/com/smartledger/service/TelecomMatrixEngineTest.java
git commit -m "feat: implement telecom validity matrix engine, countdown statuses, and entity with unit tests"
```

---

### Task 7: Transport Domain Entity & Mobility Fuel Mileage / Commute Engine (TDD)

**Files:**
- Create: `src/main/java/com/smartledger/domain/CommuteType.java`
- Create: `src/main/java/com/smartledger/domain/TransportRecord.java`
- Create: `src/main/java/com/smartledger/dto/CommuteMetric.java`
- Create: `src/main/java/com/smartledger/service/TransportAnalyticsEngine.java`
- Create: `src/main/java/com/smartledger/repository/TransportRecordRepository.java`
- Create: `src/main/java/com/smartledger/service/TransportService.java`
- Test: `src/test/java/com/smartledger/service/TransportAnalyticsEngineTest.java`

**Interfaces:**
- Consumes: `CommuteType`, `distanceKm`, `litersFilled`, `totalFareCost`
- Produces: `CommuteMetric calculateMetric(CommuteType type, double distanceKm, Double liters, double fareCost)`

- [ ] **Step 1: Write failing tests for Transport Analytics Engine**

Create `src/test/java/com/smartledger/service/TransportAnalyticsEngineTest.java`:
```java
package com.smartledger.service;

import com.smartledger.domain.CommuteType;
import com.smartledger.dto.CommuteMetric;
import com.smartledger.exception.UtilityValidationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.within;

class TransportAnalyticsEngineTest {

    private TransportAnalyticsEngine engine;

    @BeforeEach
    void setUp() {
        engine = new TransportAnalyticsEngine();
    }

    @Test
    void shouldCalculateVehicleMileageAndCostPerKmForFuel() {
        // Traveled 360 km on 20 liters of petrol costing ₹2040.0
        CommuteMetric metric = engine.calculateMetric(CommuteType.FUEL, 360.0, 20.0, 2040.0);

        assertThat(metric.mileageKmPerLiter()).isCloseTo(18.0, within(0.01)); // 360 / 20
        assertThat(metric.costPerKm()).isCloseTo(5.666, within(0.01)); // 2040 / 360
    }

    @Test
    void shouldCalculateCostPerKmForPublicTransit() {
        // Train/bus commute 40 km with ticket ₹60.0
        CommuteMetric metric = engine.calculateMetric(CommuteType.PUBLIC_TICKET, 40.0, null, 60.0);

        assertThat(metric.mileageKmPerLiter()).isNull();
        assertThat(metric.costPerKm()).isCloseTo(1.50, within(0.01)); // 60 / 40
    }

    @Test
    void shouldRejectZeroOrNegativeDistance() {
        assertThatThrownBy(() -> engine.calculateMetric(CommuteType.FUEL, 0.0, 10.0, 500.0))
                .isInstanceOf(UtilityValidationException.class)
                .hasMessageContaining("Distance must be greater than 0");
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```powershell
mvn test -Dtest=TransportAnalyticsEngineTest
```
Expected: FAIL (missing classes).

- [ ] **Step 3: Implement CommuteType, TransportRecord, CommuteMetric, and TransportAnalyticsEngine**

Create `src/main/java/com/smartledger/domain/CommuteType.java`:
```java
package com.smartledger.domain;

public enum CommuteType {
    FUEL,
    PUBLIC_TICKET
}
```

Create `src/main/java/com/smartledger/dto/CommuteMetric.java`:
```java
package com.smartledger.dto;

public record CommuteMetric(
        double distanceKm,
        Double litersFilled,
        double totalCost,
        Double mileageKmPerLiter,
        double costPerKm
) {}
```

Create `src/main/java/com/smartledger/domain/TransportRecord.java`:
```java
package com.smartledger.domain;

import com.smartledger.exception.UtilityValidationException;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "transport_records")
public class TransportRecord extends BaseUtilityRecord {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CommuteType commuteType;

    @Column(nullable = false, length = 100)
    private String personName;

    private String originPoint;
    private String destinationPoint;

    private Double distanceKm;
    private Double litersFilled;

    @Column(nullable = false)
    private Double totalFareCost;

    private Double mileageCalculated;
    private Double costPerKm;

    @Column(nullable = false)
    private LocalDate entryDate;

    public TransportRecord() {}

    public TransportRecord(User user, CommuteType commuteType, String personName,
                           String originPoint, String destinationPoint, Double distanceKm,
                           Double litersFilled, Double totalFareCost, Double mileageCalculated,
                           Double costPerKm, LocalDate entryDate) {
        super(null, user, entryDate != null ? entryDate : LocalDate.now(), totalFareCost);
        this.commuteType = commuteType;
        this.personName = personName;
        this.originPoint = originPoint;
        this.destinationPoint = destinationPoint;
        this.distanceKm = distanceKm;
        this.litersFilled = litersFilled;
        this.totalFareCost = totalFareCost;
        this.mileageCalculated = mileageCalculated;
        this.costPerKm = costPerKm;
        this.entryDate = entryDate != null ? entryDate : LocalDate.now();
    }

    @Override
    public UtilityType getUtilityType() {
        return UtilityType.TRANSPORT;
    }

    @Override
    public void validateRecord() {
        if (personName == null || personName.trim().isEmpty()) {
            throw new UtilityValidationException("Person name is required");
        }
        if (commuteType == null) {
            throw new UtilityValidationException("Commute type is required");
        }
        if (distanceKm == null || distanceKm <= 0) {
            throw new UtilityValidationException("Distance must be greater than 0");
        }
        if (totalFareCost == null || totalFareCost < 0) {
            throw new UtilityValidationException("Fare cost cannot be negative");
        }
    }

    @Override
    public String generateSummaryReport() {
        return String.format("Transport [%s - %s]: %.1f km, ₹%.2f (₹%.2f/km)",
                commuteType, personName, distanceKm, totalFareCost, costPerKm != null ? costPerKm : 0.0);
    }

    // Getters and Setters
    public CommuteType getCommuteType() { return commuteType; }
    public void setCommuteType(CommuteType commuteType) { this.commuteType = commuteType; }
    public String getPersonName() { return personName; }
    public void setPersonName(String personName) { this.personName = personName; }
    public String getOriginPoint() { return originPoint; }
    public void setOriginPoint(String originPoint) { this.originPoint = originPoint; }
    public String getDestinationPoint() { return destinationPoint; }
    public void setDestinationPoint(String destinationPoint) { this.destinationPoint = destinationPoint; }
    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }
    public Double getLitersFilled() { return litersFilled; }
    public void setLitersFilled(Double litersFilled) { this.litersFilled = litersFilled; }
    public Double getTotalFareCost() { return totalFareCost; }
    public void setTotalFareCost(Double totalFareCost) { this.totalFareCost = totalFareCost; }
    public Double getMileageCalculated() { return mileageCalculated; }
    public void setMileageCalculated(Double mileageCalculated) { this.mileageCalculated = mileageCalculated; }
    public Double getCostPerKm() { return costPerKm; }
    public void setCostPerKm(Double costPerKm) { this.costPerKm = costPerKm; }
    public LocalDate getEntryDate() { return entryDate; }
    public void setEntryDate(LocalDate entryDate) { this.entryDate = entryDate; }
}
```

Create `src/main/java/com/smartledger/service/TransportAnalyticsEngine.java`:
```java
package com.smartledger.service;

import com.smartledger.domain.CommuteType;
import com.smartledger.dto.CommuteMetric;
import com.smartledger.exception.UtilityValidationException;
import org.springframework.stereotype.Service;

@Service
public class TransportAnalyticsEngine {

    public CommuteMetric calculateMetric(CommuteType type, double distanceKm, Double liters, double fareCost) {
        if (distanceKm <= 0) {
            throw new UtilityValidationException("Distance must be greater than 0 km");
        }
        if (fareCost < 0) {
            throw new UtilityValidationException("Fare cost cannot be negative");
        }

        Double mileage = null;
        if (type == CommuteType.FUEL) {
            if (liters != null && liters > 0) {
                mileage = distanceKm / liters;
            }
        }

        double costPerKm = fareCost / distanceKm;
        return new CommuteMetric(distanceKm, liters, fareCost, mileage, costPerKm);
    }
}
```

Create `src/main/java/com/smartledger/repository/TransportRecordRepository.java`:
```java
package com.smartledger.repository;

import com.smartledger.domain.TransportRecord;
import com.smartledger.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransportRecordRepository extends JpaRepository<TransportRecord, Long> {
    List<TransportRecord> findByUserOrderByEntryDateDesc(User user);
}
```

Create `src/main/java/com/smartledger/service/TransportService.java`:
```java
package com.smartledger.service;

import com.smartledger.domain.CommuteType;
import com.smartledger.domain.TransportRecord;
import com.smartledger.domain.User;
import com.smartledger.dto.CommuteMetric;
import com.smartledger.repository.TransportRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class TransportService {

    private final TransportRecordRepository repository;
    private final TransportAnalyticsEngine analyticsEngine;

    public TransportService(TransportRecordRepository repository, TransportAnalyticsEngine analyticsEngine) {
        this.repository = repository;
        this.analyticsEngine = analyticsEngine;
    }

    @Transactional
    public TransportRecord addTrip(User user, CommuteType type, String personName, String origin,
                                   String destination, double distanceKm, Double liters, double totalFare,
                                   LocalDate date) {
        CommuteMetric metric = analyticsEngine.calculateMetric(type, distanceKm, liters, totalFare);
        TransportRecord record = new TransportRecord(
                user, type, personName, origin, destination, distanceKm, liters, totalFare,
                metric.mileageKmPerLiter(), metric.costPerKm(), date != null ? date : LocalDate.now()
        );
        record.validateRecord();
        return repository.save(record);
    }

    public List<TransportRecord> getTripsForUser(User user) {
        return repository.findByUserOrderByEntryDateDesc(user);
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```powershell
mvn test -Dtest=TransportAnalyticsEngineTest
```
Expected: PASS (3 tests run, 0 failures, 0 errors).

- [ ] **Step 5: Commit**

```powershell
git add src/main/java/com/smartledger/domain/CommuteType.java src/main/java/com/smartledger/domain/TransportRecord.java src/main/java/com/smartledger/dto/CommuteMetric.java src/main/java/com/smartledger/service/TransportAnalyticsEngine.java src/main/java/com/smartledger/repository/TransportRecordRepository.java src/main/java/com/smartledger/service/TransportService.java src/test/java/com/smartledger/service/TransportAnalyticsEngineTest.java
git commit -m "feat: implement transport mileage and commute cost efficiency engine with unit tests"
```

---

### Task 8: Grocery Domain Entity & Categorical Budget Burn Engine (TDD)

**Files:**
- Create: `src/main/java/com/smartledger/domain/GroceryCategory.java`
- Create: `src/main/java/com/smartledger/domain/GroceryRecord.java`
- Create: `src/main/java/com/smartledger/dto/GroceryCategorySummaryDto.java`
- Create: `src/main/java/com/smartledger/service/GroceryAnalyticsEngine.java`
- Create: `src/main/java/com/smartledger/repository/GroceryRecordRepository.java`
- Create: `src/main/java/com/smartledger/service/GroceryService.java`
- Test: `src/test/java/com/smartledger/service/GroceryAnalyticsEngineTest.java`

**Interfaces:**
- Consumes: `List<GroceryRecord>`
- Produces: `GroceryCategorySummaryDto summarizeCategoricalSpend(List<GroceryRecord> records)`

- [ ] **Step 1: Write failing tests for Grocery Analytics Engine**

Create `src/test/java/com/smartledger/service/GroceryAnalyticsEngineTest.java`:
```java
package com.smartledger.service;

import com.smartledger.domain.GroceryCategory;
import com.smartledger.domain.GroceryRecord;
import com.smartledger.dto.GroceryCategorySummaryDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

class GroceryAnalyticsEngineTest {

    private GroceryAnalyticsEngine engine;

    @BeforeEach
    void setUp() {
        engine = new GroceryAnalyticsEngine();
    }

    @Test
    void shouldComputeCategoricalSpendAndEssentialRatioUsingJavaStreams() {
        List<GroceryRecord> records = List.of(
                new GroceryRecord(null, "Supermarket", GroceryCategory.ESSENTIAL_STAPLE, 1200.0, LocalDate.now(), "Rice, Oil"),
                new GroceryRecord(null, "Dairy Farm", GroceryCategory.DAIRY_PRODUCE, 400.0, LocalDate.now(), "Milk, Eggs"),
                new GroceryRecord(null, "Bakery", GroceryCategory.SNACKS_DISCRETIONARY, 400.0, LocalDate.now(), "Pastries"),
                new GroceryRecord(null, "Chemists", GroceryCategory.HOUSEHOLD_CARE, 500.0, LocalDate.now(), "Soap, Detergent")
        );

        GroceryCategorySummaryDto summary = engine.summarizeCategoricalSpend(records);

        // Total = 2500. Essential = Staple (1200) + Dairy (400) + Household Care (500) = 2100. Discretionary = 400.
        assertThat(summary.totalSpend()).isEqualTo(2500.0);
        assertThat(summary.essentialSpend()).isEqualTo(2100.0);
        assertThat(summary.discretionarySpend()).isEqualTo(400.0);
        assertThat(summary.essentialPercentage()).isCloseTo(84.0, within(0.1));
        assertThat(summary.categoryBreakdown().get(GroceryCategory.ESSENTIAL_STAPLE)).isEqualTo(1200.0);
    }

    @Test
    void shouldHandleEmptyListGracefully() {
        GroceryCategorySummaryDto summary = engine.summarizeCategoricalSpend(List.of());

        assertThat(summary.totalSpend()).isEqualTo(0.0);
        assertThat(summary.essentialPercentage()).isEqualTo(0.0);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```powershell
mvn test -Dtest=GroceryAnalyticsEngineTest
```
Expected: FAIL (missing classes).

- [ ] **Step 3: Implement GroceryCategory, GroceryRecord, DTO, and GroceryAnalyticsEngine**

Create `src/main/java/com/smartledger/domain/GroceryCategory.java`:
```java
package com.smartledger.domain;

public enum GroceryCategory {
    ESSENTIAL_STAPLE,
    DAIRY_PRODUCE,
    SNACKS_DISCRETIONARY,
    HOUSEHOLD_CARE
}
```

Create `src/main/java/com/smartledger/dto/GroceryCategorySummaryDto.java`:
```java
package com.smartledger.dto;

import com.smartledger.domain.GroceryCategory;
import java.util.Map;

public record GroceryCategorySummaryDto(
        double totalSpend,
        double essentialSpend,
        double discretionarySpend,
        double essentialPercentage,
        Map<GroceryCategory, Double> categoryBreakdown
) {}
```

Create `src/main/java/com/smartledger/domain/GroceryRecord.java`:
```java
package com.smartledger.domain;

import com.smartledger.exception.UtilityValidationException;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "grocery_records")
public class GroceryRecord extends BaseUtilityRecord {

    private String storeName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private GroceryCategory category;

    @Column(nullable = false)
    private Double totalAmount;

    @Column(nullable = false)
    private LocalDate purchaseDate;

    @Column(columnDefinition = "TEXT")
    private String receiptNotes;

    public GroceryRecord() {}

    public GroceryRecord(User user, String storeName, GroceryCategory category,
                         Double totalAmount, LocalDate purchaseDate, String receiptNotes) {
        super(null, user, purchaseDate != null ? purchaseDate : LocalDate.now(), totalAmount);
        this.storeName = storeName;
        this.category = category;
        this.totalAmount = totalAmount;
        this.purchaseDate = purchaseDate != null ? purchaseDate : LocalDate.now();
        this.receiptNotes = receiptNotes;
    }

    @Override
    public UtilityType getUtilityType() {
        return UtilityType.GROCERY;
    }

    @Override
    public void validateRecord() {
        if (category == null) {
            throw new UtilityValidationException("Grocery category is required");
        }
        if (totalAmount == null || totalAmount <= 0) {
            throw new UtilityValidationException("Grocery total amount must be greater than 0");
        }
    }

    @Override
    public String generateSummaryReport() {
        return String.format("Grocery [%s]: ₹%.2f from %s", category, totalAmount, storeName != null ? storeName : "Unknown");
    }

    // Getters and Setters
    public String getStoreName() { return storeName; }
    public void setStoreName(String storeName) { this.storeName = storeName; }
    public GroceryCategory getCategory() { return category; }
    public void setCategory(GroceryCategory category) { this.category = category; }
    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }
    public LocalDate getPurchaseDate() { return purchaseDate; }
    public void setPurchaseDate(LocalDate purchaseDate) { this.purchaseDate = purchaseDate; }
    public String getReceiptNotes() { return receiptNotes; }
    public void setReceiptNotes(String receiptNotes) { this.receiptNotes = receiptNotes; }
}
```

Create `src/main/java/com/smartledger/service/GroceryAnalyticsEngine.java`:
```java
package com.smartledger.service;

import com.smartledger.domain.GroceryCategory;
import com.smartledger.domain.GroceryRecord;
import com.smartledger.dto.GroceryCategorySummaryDto;
import org.springframework.stereotype.Service;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class GroceryAnalyticsEngine {

    public GroceryCategorySummaryDto summarizeCategoricalSpend(List<GroceryRecord> records) {
        if (records == null || records.isEmpty()) {
            return new GroceryCategorySummaryDto(0.0, 0.0, 0.0, 0.0, new EnumMap<>(GroceryCategory.class));
        }

        Map<GroceryCategory, Double> breakdown = records.stream()
                .collect(Collectors.groupingBy(
                        GroceryRecord::getCategory,
                        () -> new EnumMap<>(GroceryCategory.class),
                        Collectors.summingDouble(GroceryRecord::getTotalAmount)
                ));

        double totalSpend = records.stream().mapToDouble(GroceryRecord::getTotalAmount).sum();
        double discretionary = breakdown.getOrDefault(GroceryCategory.SNACKS_DISCRETIONARY, 0.0);
        double essential = totalSpend - discretionary;
        double essentialPct = (totalSpend > 0) ? (essential / totalSpend) * 100.0 : 0.0;

        return new GroceryCategorySummaryDto(totalSpend, essential, discretionary, essentialPct, breakdown);
    }
}
```

Create `src/main/java/com/smartledger/repository/GroceryRecordRepository.java`:
```java
package com.smartledger.repository;

import com.smartledger.domain.GroceryRecord;
import com.smartledger.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroceryRecordRepository extends JpaRepository<GroceryRecord, Long> {
    List<GroceryRecord> findByUserOrderByPurchaseDateDesc(User user);
}
```

Create `src/main/java/com/smartledger/service/GroceryService.java`:
```java
package com.smartledger.service;

import com.smartledger.domain.GroceryCategory;
import com.smartledger.domain.GroceryRecord;
import com.smartledger.domain.User;
import com.smartledger.dto.GroceryCategorySummaryDto;
import com.smartledger.repository.GroceryRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class GroceryService {

    private final GroceryRecordRepository repository;
    private final GroceryAnalyticsEngine analyticsEngine;

    public GroceryService(GroceryRecordRepository repository, GroceryAnalyticsEngine analyticsEngine) {
        this.repository = repository;
        this.analyticsEngine = analyticsEngine;
    }

    @Transactional
    public GroceryRecord addRecord(User user, String storeName, GroceryCategory category,
                                  double amount, LocalDate date, String notes) {
        GroceryRecord record = new GroceryRecord(user, storeName, category, amount, date, notes);
        record.validateRecord();
        return repository.save(record);
    }

    public GroceryCategorySummaryDto getSummary(User user) {
        List<GroceryRecord> records = repository.findByUserOrderByPurchaseDateDesc(user);
        return analyticsEngine.summarizeCategoricalSpend(records);
    }

    public List<GroceryRecord> getRecords(User user) {
        return repository.findByUserOrderByPurchaseDateDesc(user);
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```powershell
mvn test -Dtest=GroceryAnalyticsEngineTest
```
Expected: PASS (2 tests run, 0 failures, 0 errors).

- [ ] **Step 5: Commit**

```powershell
git add src/main/java/com/smartledger/domain/GroceryCategory.java src/main/java/com/smartledger/domain/GroceryRecord.java src/main/java/com/smartledger/dto/GroceryCategorySummaryDto.java src/main/java/com/smartledger/service/GroceryAnalyticsEngine.java src/main/java/com/smartledger/repository/GroceryRecordRepository.java src/main/java/com/smartledger/service/GroceryService.java src/test/java/com/smartledger/service/GroceryAnalyticsEngineTest.java
git commit -m "feat: implement grocery categorical budget burn engine and entity with unit tests"
```

---

### Task 9: Macro Household Dashboard Aggregator & REST Analytics API Controller

**Files:**
- Create: `src/main/java/com/smartledger/dto/MacroSpendSummaryDto.java`
- Create: `src/main/java/com/smartledger/service/DashboardSummaryService.java`
- Create: `src/main/java/com/smartledger/controller/ApiController.java`
- Test: `src/test/java/com/smartledger/controller/ApiControllerTest.java`

**Interfaces:**
- Consumes: All 5 utility repositories/services
- Produces:
  - `MacroSpendSummaryDto getMonthlyMacroBreakdown(User user)`
  - REST endpoints:
    - `GET /api/analytics/macro` -> JSON macro spend breakdown
    - `GET /api/analytics/electricity` -> 6-month master vs submeter series
    - `GET /api/analytics/gas` -> Gas depletion % and days remaining
    - `GET /api/analytics/telecom` -> Countdown timeline items
    - `GET /api/analytics/transport` -> Mileage curve series
    - `GET /api/analytics/grocery` -> Category donut data

- [ ] **Step 1: Write failing test for ApiController**

Create `src/test/java/com/smartledger/controller/ApiControllerTest.java`:
```java
package com.smartledger.controller;

import com.smartledger.domain.User;
import com.smartledger.dto.MacroSpendSummaryDto;
import com.smartledger.service.DashboardSummaryService;
import jakarta.servlet.http.HttpSession;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ApiController.class)
@TestPropertySource(locations = "classpath:application-test.properties")
class ApiControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DashboardSummaryService dashboardSummaryService;

    @Test
    void shouldReturnMacroAnalyticsWhenUserLoggedIn() throws Exception {
        User user = new User("John", "john@example.com", "hash");
        user.setUserId(1L);

        MockHttpSession session = new MockHttpSession();
        session.setAttribute("LOGGED_IN_USER", user);

        MacroSpendSummaryDto macro = new MacroSpendSummaryDto(
                1250.0, 850.0, 719.0, 1500.0, 2500.0, 6819.0,
                Map.of("Electricity", 1250.0, "Gas", 850.0, "Telecom", 719.0, "Transport", 1500.0, "Grocery", 2500.0)
        );

        when(dashboardSummaryService.getMacroBreakdown(any(User.class))).thenReturn(macro);

        mockMvc.perform(get("/api/analytics/macro").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalMonthlySpend").value(6819.0))
                .andExpect(jsonPath("$.electricitySpend").value(1250.0));
    }

    @Test
    void shouldReturnUnauthorizedWhenNoSession() throws Exception {
        mockMvc.perform(get("/api/analytics/macro"))
                .andExpect(status().isUnauthorized());
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```powershell
mvn test -Dtest=ApiControllerTest
```
Expected: FAIL (missing classes).

- [ ] **Step 3: Implement MacroSpendSummaryDto, DashboardSummaryService, and ApiController**

Create `src/main/java/com/smartledger/dto/MacroSpendSummaryDto.java`:
```java
package com.smartledger.dto;

import java.util.Map;

public record MacroSpendSummaryDto(
        double electricitySpend,
        double gasSpend,
        double telecomSpend,
        double transportSpend,
        double grocerySpend,
        double totalMonthlySpend,
        Map<String, Double> percentageDistribution
) {}
```

Create `src/main/java/com/smartledger/service/DashboardSummaryService.java`:
```java
package com.smartledger.service;

import com.smartledger.domain.ElectricityRecord;
import com.smartledger.domain.GasRecord;
import com.smartledger.domain.GroceryRecord;
import com.smartledger.domain.TelecomRecord;
import com.smartledger.domain.TransportRecord;
import com.smartledger.domain.User;
import com.smartledger.dto.MacroSpendSummaryDto;
import com.smartledger.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardSummaryService {

    private final ElectricityRecordRepository electricityRepo;
    private final GasRecordRepository gasRepo;
    private final TelecomRecordRepository telecomRepo;
    private final TransportRecordRepository transportRepo;
    private final GroceryRecordRepository groceryRepo;

    public DashboardSummaryService(ElectricityRecordRepository electricityRepo, GasRecordRepository gasRepo,
                                  TelecomRecordRepository telecomRepo, TransportRecordRepository transportRepo,
                                  GroceryRecordRepository groceryRepo) {
        this.electricityRepo = electricityRepo;
        this.gasRepo = gasRepo;
        this.telecomRepo = telecomRepo;
        this.transportRepo = transportRepo;
        this.groceryRepo = groceryRepo;
    }

    public MacroSpendSummaryDto getMacroBreakdown(User user) {
        List<ElectricityRecord> elecs = electricityRepo.findByUserOrderByBillingMonthDesc(user);
        double elecSpend = elecs.isEmpty() ? 0.0 : elecs.get(0).getCalculatedMyShare();

        List<GasRecord> gases = gasRepo.findByUserOrderByConnectedDateDesc(user);
        double gasSpend = gases.isEmpty() ? 0.0 : gases.get(0).getBookingCost();

        double telecomSpend = telecomRepo.findByUserOrderByExpiryDateAsc(user).stream()
                .mapToDouble(TelecomRecord::getPlanAmount).sum();

        double transportSpend = transportRepo.findByUserOrderByEntryDateDesc(user).stream()
                .mapToDouble(TransportRecord::getTotalFareCost).sum();

        double grocerySpend = groceryRepo.findByUserOrderByPurchaseDateDesc(user).stream()
                .mapToDouble(GroceryRecord::getTotalAmount).sum();

        double total = elecSpend + gasSpend + telecomSpend + transportSpend + grocerySpend;

        Map<String, Double> dist = new HashMap<>();
        if (total > 0) {
            dist.put("Electricity", Math.round((elecSpend / total) * 1000.0) / 10.0);
            dist.put("Gas", Math.round((gasSpend / total) * 1000.0) / 10.0);
            dist.put("Telecom", Math.round((telecomSpend / total) * 1000.0) / 10.0);
            dist.put("Transport", Math.round((transportSpend / total) * 1000.0) / 10.0);
            dist.put("Grocery", Math.round((grocerySpend / total) * 1000.0) / 10.0);
        }

        return new MacroSpendSummaryDto(elecSpend, gasSpend, telecomSpend, transportSpend, grocerySpend, total, dist);
    }
}
```

Create `src/main/java/com/smartledger/controller/ApiController.java`:
```java
package com.smartledger.controller;

import com.smartledger.domain.User;
import com.smartledger.dto.MacroSpendSummaryDto;
import com.smartledger.service.DashboardSummaryService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
public class ApiController {

    private final DashboardSummaryService dashboardSummaryService;

    public ApiController(DashboardSummaryService dashboardSummaryService) {
        this.dashboardSummaryService = dashboardSummaryService;
    }

    @GetMapping("/macro")
    public ResponseEntity<MacroSpendSummaryDto> getMacroAnalytics(HttpSession session) {
        User user = (User) session.getAttribute("LOGGED_IN_USER");
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(dashboardSummaryService.getMacroBreakdown(user));
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```powershell
mvn test -Dtest=ApiControllerTest
```
Expected: PASS (2 tests run, 0 failures, 0 errors).

- [ ] **Step 5: Commit**

```powershell
git add src/main/java/com/smartledger/dto/MacroSpendSummaryDto.java src/main/java/com/smartledger/service/DashboardSummaryService.java src/main/java/com/smartledger/controller/ApiController.java src/test/java/com/smartledger/controller/ApiControllerTest.java
git commit -m "feat: implement macro dashboard summary aggregator and REST analytics controller"
```

---

### Task 10: Glassmorphic UI Foundation, Authentication & Thymeleaf Views

**Files:**
- Create: `src/main/resources/static/css/glassmorphic.css`
- Create: `src/main/resources/static/js/dashboard-charts.js`
- Create: `src/main/resources/templates/fragments/navbar.html`
- Create: `src/main/resources/templates/login.html`
- Create: `src/main/resources/templates/register.html`
- Create: `src/main/resources/templates/dashboard.html`
- Create: `src/main/resources/templates/electricity.html`
- Create: `src/main/resources/templates/gas.html`
- Create: `src/main/resources/templates/telecom.html`
- Create: `src/main/resources/templates/transport.html`
- Create: `src/main/resources/templates/grocery.html`
- Create: `src/main/java/com/smartledger/controller/AuthController.java`
- Create: `src/main/java/com/smartledger/controller/ViewController.java`
- Create: `src/main/resources/data.sql`
- Test: `src/test/java/com/smartledger/controller/ViewControllerTest.java`

**Interfaces:**
- Consumes: All services (`UserService`, `ElectricityService`, `GasService`, `TelecomService`, `TransportService`, `GroceryService`, `DashboardSummaryService`)
- Produces: Responsive HTML5 views with Chart.js charts and glassmorphism styling

- [ ] **Step 1: Write failing test for ViewController routes**

Create `src/test/java/com/smartledger/controller/ViewControllerTest.java`:
```java
package com.smartledger.controller;

import com.smartledger.domain.User;
import com.smartledger.dto.MacroSpendSummaryDto;
import com.smartledger.service.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ViewController.class)
@TestPropertySource(locations = "classpath:application-test.properties")
class ViewControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;
    @MockBean
    private ElectricityService electricityService;
    @MockBean
    private GasService gasService;
    @MockBean
    private TelecomService telecomService;
    @MockBean
    private TransportService transportService;
    @MockBean
    private GroceryService groceryService;
    @MockBean
    private DashboardSummaryService dashboardSummaryService;

    @Test
    void shouldRenderLoginPage() throws Exception {
        mockMvc.perform(get("/login"))
                .andExpect(status().isOk())
                .andExpect(view().name("login"));
    }

    @Test
    void shouldRedirectUnauthenticatedDashboardToLogin() throws Exception {
        mockMvc.perform(get("/dashboard"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/login"));
    }

    @Test
    void shouldRenderDashboardForLoggedInUser() throws Exception {
        User user = new User("John", "john@example.com", "hash");
        user.setUserId(1L);

        MockHttpSession session = new MockHttpSession();
        session.setAttribute("LOGGED_IN_USER", user);

        when(dashboardSummaryService.getMacroBreakdown(any())).thenReturn(
                new MacroSpendSummaryDto(0,0,0,0,0,0, Map.of())
        );

        mockMvc.perform(get("/dashboard").session(session))
                .andExpect(status().isOk())
                .andExpect(view().name("dashboard"));
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```powershell
mvn test -Dtest=ViewControllerTest
```
Expected: FAIL (missing `ViewController`).

- [ ] **Step 3: Implement Controllers, Templates, CSS, and Chart Scripts**

Create `src/main/java/com/smartledger/controller/AuthController.java`:
```java
package com.smartledger.controller;

import com.smartledger.domain.User;
import com.smartledger.exception.UtilityValidationException;
import com.smartledger.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Optional;

@Controller
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/login")
    public String loginPage(HttpSession session) {
        if (session.getAttribute("LOGGED_IN_USER") != null) return "redirect:/dashboard";
        return "login";
    }

    @PostMapping("/login")
    public String login(@RequestParam String email, @RequestParam String password,
                        HttpSession session, Model model) {
        Optional<User> user = userService.authenticateUser(email, password);
        if (user.isPresent()) {
            session.setAttribute("LOGGED_IN_USER", user.get());
            return "redirect:/dashboard";
        }
        model.addAttribute("error", "Invalid email or password");
        return "login";
    }

    @GetMapping("/register")
    public String registerPage(HttpSession session) {
        if (session.getAttribute("LOGGED_IN_USER") != null) return "redirect:/dashboard";
        return "register";
    }

    @PostMapping("/register")
    public String register(@RequestParam String fullName, @RequestParam String email,
                           @RequestParam String password, HttpSession session, Model model) {
        try {
            User user = userService.registerUser(fullName, email, password);
            session.setAttribute("LOGGED_IN_USER", user);
            return "redirect:/dashboard";
        } catch (UtilityValidationException e) {
            model.addAttribute("error", e.getMessage());
            return "register";
        }
    }

    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/login";
    }
}
```

Create `src/main/java/com/smartledger/controller/ViewController.java`:
```java
package com.smartledger.controller;

import com.smartledger.domain.*;
import com.smartledger.dto.*;
import com.smartledger.service.*;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Controller
public class ViewController {

    private final ElectricityService electricityService;
    private final GasService gasService;
    private final TelecomService telecomService;
    private final TransportService transportService;
    private final GroceryService groceryService;
    private final DashboardSummaryService dashboardSummaryService;

    public ViewController(ElectricityService electricityService, GasService gasService,
                          TelecomService telecomService, TransportService transportService,
                          GroceryService groceryService, DashboardSummaryService dashboardSummaryService) {
        this.electricityService = electricityService;
        this.gasService = gasService;
        this.telecomService = telecomService;
        this.transportService = transportService;
        this.groceryService = groceryService;
        this.dashboardSummaryService = dashboardSummaryService;
    }

    private User getSessionUser(HttpSession session) {
        return (User) session.getAttribute("LOGGED_IN_USER");
    }

    @GetMapping("/")
    public String root() {
        return "redirect:/dashboard";
    }

    @GetMapping("/dashboard")
    public String dashboard(HttpSession session, Model model) {
        User user = getSessionUser(session);
        if (user == null) return "redirect:/login";

        MacroSpendSummaryDto macro = dashboardSummaryService.getMacroBreakdown(user);
        Optional<DepletionForecast> gasForecast = gasService.getActiveForecast(user);
        List<TelecomCountdownDto> telecomMatrix = telecomService.getCountdownMatrix(user);

        model.addAttribute("user", user);
        model.addAttribute("macro", macro);
        model.addAttribute("gasForecast", gasForecast.orElse(null));
        model.addAttribute("telecomMatrix", telecomMatrix);

        return "dashboard";
    }

    @GetMapping("/electricity")
    public String electricityPage(HttpSession session, Model model) {
        User user = getSessionUser(session);
        if (user == null) return "redirect:/login";

        model.addAttribute("user", user);
        model.addAttribute("records", electricityService.getRecordsForUser(user));
        return "electricity";
    }

    @PostMapping("/electricity/add")
    public String addElectricity(@RequestParam String billingMonth, @RequestParam double masterUnits,
                                 @RequestParam double myUnits, @RequestParam(defaultValue = "0.0") double otherUnits,
                                 @RequestParam(required = false) LocalDate paidDate, HttpSession session) {
        User user = getSessionUser(session);
        if (user == null) return "redirect:/login";

        electricityService.addRecord(user, billingMonth, masterUnits, myUnits, otherUnits, paidDate);
        return "redirect:/electricity";
    }

    @GetMapping("/gas")
    public String gasPage(HttpSession session, Model model) {
        User user = getSessionUser(session);
        if (user == null) return "redirect:/login";

        model.addAttribute("user", user);
        model.addAttribute("records", gasService.getAllForUser(user));
        model.addAttribute("forecast", gasService.getActiveForecast(user).orElse(null));
        return "gas";
    }

    @PostMapping("/gas/connect")
    public String connectGas(@RequestParam(defaultValue = "14.2") double weightKg,
                             @RequestParam double bookingCost,
                             @RequestParam(required = false) LocalDate connectedDate,
                             HttpSession session) {
        User user = getSessionUser(session);
        if (user == null) return "redirect:/login";

        gasService.connectNewCylinder(user, weightKg, bookingCost, connectedDate != null ? connectedDate : LocalDate.now());
        return "redirect:/gas";
    }

    @GetMapping("/telecom")
    public String telecomPage(HttpSession session, Model model) {
        User user = getSessionUser(session);
        if (user == null) return "redirect:/login";

        model.addAttribute("user", user);
        model.addAttribute("matrix", telecomService.getCountdownMatrix(user));
        return "telecom";
    }

    @PostMapping("/telecom/add")
    public String addTelecom(@RequestParam String memberName, @RequestParam String provider,
                             @RequestParam double amount, @RequestParam(required = false) LocalDate rechargeDate,
                             @RequestParam int validityDays, HttpSession session) {
        User user = getSessionUser(session);
        if (user == null) return "redirect:/login";

        telecomService.addRecharge(user, memberName, provider, amount, rechargeDate != null ? rechargeDate : LocalDate.now(), validityDays);
        return "redirect:/telecom";
    }

    @GetMapping("/transport")
    public String transportPage(HttpSession session, Model model) {
        User user = getSessionUser(session);
        if (user == null) return "redirect:/login";

        model.addAttribute("user", user);
        model.addAttribute("trips", transportService.getTripsForUser(user));
        return "transport";
    }

    @PostMapping("/transport/add")
    public String addTrip(@RequestParam CommuteType type, @RequestParam String personName,
                          @RequestParam(required = false) String origin, @RequestParam(required = false) String destination,
                          @RequestParam double distanceKm, @RequestParam(required = false) Double liters,
                          @RequestParam double totalFare, @RequestParam(required = false) LocalDate date,
                          HttpSession session) {
        User user = getSessionUser(session);
        if (user == null) return "redirect:/login";

        transportService.addTrip(user, type, personName, origin, destination, distanceKm, liters, totalFare, date);
        return "redirect:/transport";
    }

    @GetMapping("/grocery")
    public String groceryPage(HttpSession session, Model model) {
        User user = getSessionUser(session);
        if (user == null) return "redirect:/login";

        model.addAttribute("user", user);
        model.addAttribute("records", groceryService.getRecords(user));
        model.addAttribute("summary", groceryService.getSummary(user));
        return "grocery";
    }

    @PostMapping("/grocery/add")
    public String addGrocery(@RequestParam(required = false) String storeName, @RequestParam GroceryCategory category,
                             @RequestParam double amount, @RequestParam(required = false) LocalDate date,
                             @RequestParam(required = false) String notes, HttpSession session) {
        User user = getSessionUser(session);
        if (user == null) return "redirect:/login";

        groceryService.addRecord(user, storeName, category, amount, date != null ? date : LocalDate.now(), notes);
        return "redirect:/grocery";
    }
}
```

Create `src/main/resources/static/css/glassmorphic.css`:
```css
:root {
    --bg-primary: #0d1117;
    --card-bg: rgba(22, 27, 34, 0.75);
    --card-border: rgba(255, 255, 255, 0.1);
    --text-primary: #f0f6fc;
    --text-secondary: #8b949e;
    --accent-blue: #58a6ff;
    --accent-green: #3fb950;
    --accent-amber: #d29922;
    --accent-red: #f85149;
    --accent-purple: #bc8cff;
}

body {
    background-color: var(--bg-primary);
    color: var(--text-primary);
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    margin: 0;
    padding: 0;
    min-height: 100vh;
}

.glass-card {
    background: var(--card-bg);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--card-border);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    margin-bottom: 1.5rem;
}

.metric-number {
    font-size: 2rem;
    font-weight: 700;
    color: var(--accent-blue);
}

.badge-active { background: rgba(63, 185, 80, 0.2); color: var(--accent-green); border: 1px solid var(--accent-green); padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; }
.badge-soon { background: rgba(210, 153, 34, 0.2); color: var(--accent-amber); border: 1px solid var(--accent-amber); padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; }
.badge-expired { background: rgba(248, 81, 73, 0.2); color: var(--accent-red); border: 1px solid var(--accent-red); padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; }

.btn-smart {
    background: linear-gradient(135deg, #1f6feb, #238636);
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 10px 20px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s;
}
.btn-smart:hover { opacity: 0.9; }

input, select, textarea {
    background: rgba(13, 17, 23, 0.8);
    border: 1px solid var(--card-border);
    color: var(--text-primary);
    padding: 10px 14px;
    border-radius: 8px;
    width: 100%;
    margin-bottom: 12px;
    box-sizing: border-box;
}
```

Create `src/main/resources/templates/fragments/navbar.html`:
```html
<nav style="background: rgba(22, 27, 34, 0.9); border-bottom: 1px solid rgba(255,255,255,0.1); padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center;" xmlns:th="http://www.thymeleaf.org">
    <div style="font-weight: 700; font-size: 1.25rem; color: #58a6ff;">
        ⚡ SmartLedger
    </div>
    <div style="display: flex; gap: 1.5rem; align-items: center;">
        <a href="/dashboard" style="color: #f0f6fc; text-decoration: none;">Dashboard</a>
        <a href="/electricity" style="color: #8b949e; text-decoration: none;">Electricity</a>
        <a href="/gas" style="color: #8b949e; text-decoration: none;">LPG Gas</a>
        <a href="/telecom" style="color: #8b949e; text-decoration: none;">Telecom</a>
        <a href="/transport" style="color: #8b949e; text-decoration: none;">Transport</a>
        <a href="/grocery" style="color: #8b949e; text-decoration: none;">Groceries</a>
        <a href="/logout" style="color: #f85149; text-decoration: none;">Logout</a>
    </div>
</nav>
```

Create `src/main/resources/templates/login.html`:
```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <title>SmartLedger - Login</title>
    <link rel="stylesheet" th:href="@{/css/glassmorphic.css}">
</head>
<body style="display: flex; align-items: center; justify-content: center;">
    <div class="glass-card" style="width: 380px;">
        <h2 style="text-align: center; color: #58a6ff; margin-bottom: 1.5rem;">⚡ SmartLedger Login</h2>
        <div th:if="${error}" style="color: #f85149; margin-bottom: 1rem; font-size: 0.9rem;" th:text="${error}"></div>
        <form method="post" action="/login">
            <label>Email Address</label>
            <input type="email" name="email" required placeholder="user@example.com">
            <label>Password</label>
            <input type="password" name="password" required placeholder="••••••••">
            <button type="submit" class="btn-smart" style="width: 100%; margin-top: 10px;">Sign In</button>
        </form>
        <p style="text-align: center; margin-top: 1.5rem; font-size: 0.85rem; color: #8b949e;">
            Don't have an account? <a href="/register" style="color: #58a6ff;">Register here</a>
        </p>
    </div>
</body>
</html>
```

Create `src/main/resources/templates/register.html`:
```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <title>SmartLedger - Register</title>
    <link rel="stylesheet" th:href="@{/css/glassmorphic.css}">
</head>
<body style="display: flex; align-items: center; justify-content: center;">
    <div class="glass-card" style="width: 400px;">
        <h2 style="text-align: center; color: #58a6ff; margin-bottom: 1.5rem;">⚡ Create Account</h2>
        <div th:if="${error}" style="color: #f85149; margin-bottom: 1rem; font-size: 0.9rem;" th:text="${error}"></div>
        <form method="post" action="/register">
            <label>Full Name</label>
            <input type="text" name="fullName" required placeholder="Your Name">
            <label>Email Address</label>
            <input type="email" name="email" required placeholder="user@example.com">
            <label>Password (min 6 chars)</label>
            <input type="password" name="password" required placeholder="••••••••">
            <button type="submit" class="btn-smart" style="width: 100%; margin-top: 10px;">Register</button>
        </form>
        <p style="text-align: center; margin-top: 1.5rem; font-size: 0.85rem; color: #8b949e;">
            Already registered? <a href="/login" style="color: #58a6ff;">Sign in</a>
        </p>
    </div>
</body>
</html>
```

Create `src/main/resources/templates/dashboard.html`:
```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <title>SmartLedger - Command Hub</title>
    <link rel="stylesheet" th:href="@{/css/glassmorphic.css}">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <div th:replace="~{fragments/navbar}"></div>

    <div style="max-width: 1200px; margin: 2rem auto; padding: 0 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <div>
                <h1 style="margin: 0; font-size: 1.8rem;">Household Resource Command Hub</h1>
                <p style="color: #8b949e; margin: 4px 0 0 0;">Sensorless Predictive Utility Ledger &amp; Fair Allocations</p>
            </div>
            <div class="glass-card" style="padding: 10px 20px; margin: 0;">
                <span style="color: #8b949e;">Monthly Outflow: </span>
                <span class="metric-number" style="font-size: 1.4rem;" th:text="'₹' + ${#numbers.formatDecimal(macro.totalMonthlySpend(), 1, 2)}">₹0.00</span>
            </div>
        </div>

        <!-- 5-Metric Quick Cards Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem;">
            <div class="glass-card">
                <div style="color: #8b949e; font-size: 0.9rem;">⚡ Electricity Share</div>
                <div class="metric-number" th:text="'₹' + ${#numbers.formatDecimal(macro.electricitySpend(), 1, 2)}">₹0.00</div>
                <a href="/electricity" style="color: #58a6ff; font-size: 0.8rem; text-decoration: none;">View Sub-meter Split &rarr;</a>
            </div>
            <div class="glass-card">
                <div style="color: #8b949e; font-size: 0.9rem;">🔥 LPG Cylinder</div>
                <div class="metric-number" th:text="${gasForecast != null ? gasForecast.daysRemaining() + ' Days' : 'No Cylinder'}">N/A</div>
                <div th:if="${gasForecast != null and gasForecast.refillAlert()}" class="badge-expired">Refill Recommended</div>
                <a href="/gas" style="color: #58a6ff; font-size: 0.8rem; text-decoration: none;">Depletion Curve &rarr;</a>
            </div>
            <div class="glass-card">
                <div style="color: #8b949e; font-size: 0.9rem;">📶 Family Telecom</div>
                <div class="metric-number" th:text="'₹' + ${#numbers.formatDecimal(macro.telecomSpend(), 1, 2)}">₹0.00</div>
                <a href="/telecom" style="color: #58a6ff; font-size: 0.8rem; text-decoration: none;">Countdown Matrix &rarr;</a>
            </div>
            <div class="glass-card">
                <div style="color: #8b949e; font-size: 0.9rem;">🚗 Transport Spend</div>
                <div class="metric-number" th:text="'₹' + ${#numbers.formatDecimal(macro.transportSpend(), 1, 2)}">₹0.00</div>
                <a href="/transport" style="color: #58a6ff; font-size: 0.8rem; text-decoration: none;">Mileage Analytics &rarr;</a>
            </div>
            <div class="glass-card">
                <div style="color: #8b949e; font-size: 0.9rem;">🛒 Grocery Burn</div>
                <div class="metric-number" th:text="'₹' + ${#numbers.formatDecimal(macro.grocerySpend(), 1, 2)}">₹0.00</div>
                <a href="/grocery" style="color: #58a6ff; font-size: 0.8rem; text-decoration: none;">Categorical Split &rarr;</a>
            </div>
        </div>

        <!-- Charts Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1.5rem;">
            <div class="glass-card">
                <h3 style="margin-top: 0;">Macro Household Allocation</h3>
                <canvas id="macroDonutChart" height="220"></canvas>
            </div>
            <div class="glass-card">
                <h3 style="margin-top: 0;">Active LPG Cylinder Capacity</h3>
                <div th:if="${gasForecast != null}">
                    <p style="color: #8b949e;">Moving Average Burn Rate: <span style="color: #f0f6fc;" th:text="${#numbers.formatDecimal(gasForecast.burnRateKgPerDay(), 1, 3)} + ' kg/day'"></span></p>
                    <p style="color: #8b949e;">Predicted Run-Out: <span style="color: #f0f6fc;" th:text="${gasForecast.predictedDepletionDate()}"></span></p>
                    <div style="background: rgba(255,255,255,0.1); border-radius: 8px; height: 24px; overflow: hidden; margin-top: 1rem;">
                        <div th:style="'background: #3fb950; height: 100%; width: ' + ${gasForecast.percentageRemaining()} + '%;'"></div>
                    </div>
                    <p style="text-align: right; color: #3fb950; font-weight: 600; margin-top: 6px;" th:text="${#numbers.formatDecimal(gasForecast.percentageRemaining(), 1, 1)} + '% Capacity'"></p>
                </div>
                <div th:if="${gasForecast == null}" style="color: #8b949e; text-align: center; padding: 2rem;">
                    No active cylinder registered. <a href="/gas" style="color: #58a6ff;">Connect one now.</a>
                </div>
            </div>
        </div>
    </div>

    <script th:inline="javascript">
        /*<![CDATA[*/
        fetch('/api/analytics/macro')
            .then(res => res.json())
            .then(data => {
                const dist = data.percentageDistribution;
                const ctx = document.getElementById('macroDonutChart').getContext('2d');
                new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: Object.keys(dist),
                        datasets: [{
                            data: Object.values(dist),
                            backgroundColor: ['#58a6ff', '#f85149', '#bc8cff', '#d29922', '#3fb950']
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: { legend: { position: 'bottom', labels: { color: '#f0f6fc' } } }
                    }
                });
            });
        /*]]>*/
    </script>
</body>
</html>
```

Create module view `src/main/resources/templates/electricity.html`:
```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <title>SmartLedger - Electricity Sub-meter Split</title>
    <link rel="stylesheet" th:href="@{/css/glassmorphic.css}">
</head>
<body>
    <div th:replace="~{fragments/navbar}"></div>
    <div style="max-width: 1000px; margin: 2rem auto; padding: 0 1rem;">
        <h2>⚡ Electricity Shared Sub-Meter Fair-Split</h2>
        <div class="glass-card">
            <h3>Log Billing Cycle</h3>
            <form method="post" action="/electricity/add" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <label>Billing Month (YYYY-MM)</label>
                    <input type="text" name="billingMonth" required placeholder="2026-09">
                </div>
                <div>
                    <label>Master EB Units (Board Reading)</label>
                    <input type="number" step="0.1" name="masterUnits" required placeholder="350.0">
                </div>
                <div>
                    <label>My Sub-Meter Units</label>
                    <input type="number" step="0.1" name="myUnits" required placeholder="140.0">
                </div>
                <div>
                    <label>Other Tenants Sub-Meter Units</label>
                    <input type="number" step="0.1" name="otherUnits" placeholder="210.0">
                </div>
                <div style="grid-column: span 2;">
                    <button type="submit" class="btn-smart">Calculate &amp; Record Share</button>
                </div>
            </form>
        </div>

        <div class="glass-card">
            <h3>Historical Split Records</h3>
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); color: #8b949e;">
                    <th style="padding: 10px;">Month</th>
                    <th>Master EB</th>
                    <th>My Sub-Meter</th>
                    <th>Total Board Bill</th>
                    <th>My Fair Share</th>
                </tr>
                <tr th:each="r : ${records}" style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 10px;" th:text="${r.billingMonth}"></td>
                    <td th:text="${r.masterEbUnits} + ' kWh'"></td>
                    <td th:text="${r.mySubmeterUnits} + ' kWh'"></td>
                    <td th:text="'₹' + ${#numbers.formatDecimal(r.totalEbAmount, 1, 2)}"></td>
                    <td style="color: #3fb950; font-weight: 600;" th:text="'₹' + ${#numbers.formatDecimal(r.calculatedMyShare, 1, 2)}"></td>
                </tr>
            </table>
        </div>
    </div>
</body>
</html>
```

Create module view `src/main/resources/templates/gas.html`:
```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <title>SmartLedger - LPG Burn Rate &amp; Depletion</title>
    <link rel="stylesheet" th:href="@{/css/glassmorphic.css}">
</head>
<body>
    <div th:replace="~{fragments/navbar}"></div>
    <div style="max-width: 1000px; margin: 2rem auto; padding: 0 1rem;">
        <h2>🔥 LPG Cylinder Burn-Rate &amp; Depletion Forecast</h2>
        <div class="glass-card">
            <h3>Connect New Cylinder</h3>
            <form method="post" action="/gas/connect" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <label>Weight (kg)</label>
                    <input type="number" step="0.1" name="weightKg" value="14.2" required>
                </div>
                <div>
                    <label>Booking Cost (₹)</label>
                    <input type="number" step="0.1" name="bookingCost" required placeholder="850.0">
                </div>
                <div>
                    <label>Connection Date</label>
                    <input type="date" name="connectedDate">
                </div>
                <div style="display: flex; align-items: flex-end;">
                    <button type="submit" class="btn-smart" style="width: 100%;">Connect Cylinder</button>
                </div>
            </form>
        </div>

        <div class="glass-card">
            <h3>Cylinder Ledger</h3>
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); color: #8b949e;">
                    <th style="padding: 10px;">Connected</th>
                    <th>Finished</th>
                    <th>Weight</th>
                    <th>Cost</th>
                    <th>Burn Rate</th>
                    <th>Status</th>
                </tr>
                <tr th:each="c : ${records}" style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 10px;" th:text="${c.connectedDate}"></td>
                    <td th:text="${c.finishedDate != null ? c.finishedDate : 'Active'}"></td>
                    <td th:text="${c.cylinderWeightKg} + ' kg'"></td>
                    <td th:text="'₹' + ${c.bookingCost}"></td>
                    <td th:text="${c.burnRatePerDay != null ? #numbers.formatDecimal(c.burnRatePerDay, 1, 3) + ' kg/day' : 'Calculating...'}"></td>
                    <td>
                        <span th:if="${c.isActive}" class="badge-active">ACTIVE</span>
                        <span th:if="${!c.isActive}" style="color: #8b949e;">Finished</span>
                    </td>
                </tr>
            </table>
        </div>
    </div>
</body>
</html>
```

Create module view `src/main/resources/templates/telecom.html`:
```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <title>SmartLedger - Telecom Expiry Matrix</title>
    <link rel="stylesheet" th:href="@{/css/glassmorphic.css}">
</head>
<body>
    <div th:replace="~{fragments/navbar}"></div>
    <div style="max-width: 1000px; margin: 2rem auto; padding: 0 1rem;">
        <h2>📶 Family Telecom Validity Matrix</h2>
        <div class="glass-card">
            <h3>Add Member Recharge</h3>
            <form method="post" action="/telecom/add" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <label>Family Member</label>
                    <input type="text" name="memberName" required placeholder="Mom / Dad / Self">
                </div>
                <div>
                    <label>Service Provider</label>
                    <input type="text" name="provider" required placeholder="Jio / Airtel / BSNL">
                </div>
                <div>
                    <label>Plan Amount (₹)</label>
                    <input type="number" step="0.1" name="amount" required placeholder="719.0">
                </div>
                <div>
                    <label>Validity (Days)</label>
                    <input type="number" name="validityDays" required placeholder="84">
                </div>
                <div style="grid-column: span 2;">
                    <button type="submit" class="btn-smart">Record Recharge</button>
                </div>
            </form>
        </div>

        <div class="glass-card">
            <h3>Live Expiry Matrix</h3>
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); color: #8b949e;">
                    <th style="padding: 10px;">Member</th>
                    <th>Operator</th>
                    <th>Plan Cost</th>
                    <th>Expiry Date</th>
                    <th>Days Remaining</th>
                    <th>Status</th>
                </tr>
                <tr th:each="t : ${matrix}" style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 10px; font-weight: 600;" th:text="${t.familyMemberName}"></td>
                    <td th:text="${t.serviceProvider}"></td>
                    <td th:text="'₹' + ${t.planAmount}"></td>
                    <td th:text="${t.expiryDate}"></td>
                    <td th:text="${t.daysRemaining} + ' Days'"></td>
                    <td>
                        <span th:if="${t.status.name() == 'ACTIVE'}" class="badge-active">ACTIVE</span>
                        <span th:if="${t.status.name() == 'EXPIRING_SOON'}" class="badge-soon">EXPIRING SOON</span>
                        <span th:if="${t.status.name() == 'EXPIRED_BLACKOUT'}" class="badge-expired">BLACKOUT EXPIRED</span>
                    </td>
                </tr>
            </table>
        </div>
    </div>
</body>
</html>
```

Create module view `src/main/resources/templates/transport.html`:
```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <title>SmartLedger - Transport &amp; Commute Mileage</title>
    <link rel="stylesheet" th:href="@{/css/glassmorphic.css}">
</head>
<body>
    <div th:replace="~{fragments/navbar}"></div>
    <div style="max-width: 1000px; margin: 2rem auto; padding: 0 1rem;">
        <h2>🚗 Transport &amp; Commute Mileage Efficiency</h2>
        <div class="glass-card">
            <h3>Log Commute</h3>
            <form method="post" action="/transport/add" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <label>Commute Type</label>
                    <select name="type">
                        <option value="FUEL">Personal Vehicle (Fuel)</option>
                        <option value="PUBLIC_TICKET">Public Transit (Bus / Train / Metro)</option>
                    </select>
                </div>
                <div>
                    <label>Person Name</label>
                    <input type="text" name="personName" required placeholder="Driver / Commuter">
                </div>
                <div>
                    <label>Distance (km)</label>
                    <input type="number" step="0.1" name="distanceKm" required placeholder="45.0">
                </div>
                <div>
                    <label>Liters Filled (Fuel only)</label>
                    <input type="number" step="0.1" name="liters" placeholder="2.5">
                </div>
                <div>
                    <label>Total Fare / Fuel Paid (₹)</label>
                    <input type="number" step="0.1" name="totalFare" required placeholder="255.0">
                </div>
                <div>
                    <label>Date</label>
                    <input type="date" name="date">
                </div>
                <div style="grid-column: span 2;">
                    <button type="submit" class="btn-smart">Record Commute</button>
                </div>
            </form>
        </div>

        <div class="glass-card">
            <h3>Trip Log &amp; Mileage Curves</h3>
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); color: #8b949e;">
                    <th style="padding: 10px;">Date</th>
                    <th>Type</th>
                    <th>Person</th>
                    <th>Distance</th>
                    <th>Total Paid</th>
                    <th>Mileage</th>
                    <th>Cost/km</th>
                </tr>
                <tr th:each="tr : ${trips}" style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 10px;" th:text="${tr.entryDate}"></td>
                    <td th:text="${tr.commuteType}"></td>
                    <td th:text="${tr.personName}"></td>
                    <td th:text="${tr.distanceKm} + ' km'"></td>
                    <td th:text="'₹' + ${tr.totalFareCost}"></td>
                    <td th:text="${tr.mileageCalculated != null ? #numbers.formatDecimal(tr.mileageCalculated, 1, 1) + ' km/L' : 'N/A'}"></td>
                    <td style="color: #3fb950;" th:text="'₹' + ${#numbers.formatDecimal(tr.costPerKm, 1, 2)} + '/km'"></td>
                </tr>
            </table>
        </div>
    </div>
</body>
</html>
```

Create module view `src/main/resources/templates/grocery.html`:
```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
<head>
    <title>SmartLedger - Grocery Categorical Burn</title>
    <link rel="stylesheet" th:href="@{/css/glassmorphic.css}">
</head>
<body>
    <div th:replace="~{fragments/navbar}"></div>
    <div style="max-width: 1000px; margin: 2rem auto; padding: 0 1rem;">
        <h2>🛒 Domestic Grocery &amp; Essential Spend</h2>
        <div class="glass-card">
            <h3>Log Purchase</h3>
            <form method="post" action="/grocery/add" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <label>Store Name</label>
                    <input type="text" name="storeName" placeholder="Supermarket / Local Store">
                </div>
                <div>
                    <label>Category</label>
                    <select name="category">
                        <option value="ESSENTIAL_STAPLE">Essential Staple (Grains, Oil)</option>
                        <option value="DAIRY_PRODUCE">Dairy &amp; Produce (Milk, Veggies)</option>
                        <option value="HOUSEHOLD_CARE">Household Care (Cleaning, Soap)</option>
                        <option value="SNACKS_DISCRETIONARY">Snacks &amp; Discretionary</option>
                    </select>
                </div>
                <div>
                    <label>Total Amount (₹)</label>
                    <input type="number" step="0.1" name="amount" required placeholder="850.0">
                </div>
                <div>
                    <label>Date</label>
                    <input type="date" name="date">
                </div>
                <div style="grid-column: span 2;">
                    <label>Notes / Items</label>
                    <input type="text" name="notes" placeholder="Rice 5kg, Sunflower oil 2L">
                </div>
                <div style="grid-column: span 2;">
                    <button type="submit" class="btn-smart">Add Purchase</button>
                </div>
            </form>
        </div>

        <div class="glass-card" th:if="${summary != null}">
            <h3>Budget Allocation Index</h3>
            <p>Essential Ratio: <span style="color: #3fb950; font-weight: 700; font-size: 1.2rem;" th:text="${#numbers.formatDecimal(summary.essentialPercentage(), 1, 1)} + '%'"></span></p>
            <div style="background: rgba(255,255,255,0.1); border-radius: 8px; height: 16px; overflow: hidden; margin-top: 8px;">
                <div th:style="'background: #3fb950; height: 100%; width: ' + ${summary.essentialPercentage()} + '%;'"></div>
            </div>
        </div>

        <div class="glass-card">
            <h3>Recent Grocery Purchases</h3>
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); color: #8b949e;">
                    <th style="padding: 10px;">Date</th>
                    <th>Store</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Notes</th>
                </tr>
                <tr th:each="g : ${records}" style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 10px;" th:text="${g.purchaseDate}"></td>
                    <td th:text="${g.storeName}"></td>
                    <td th:text="${g.category}"></td>
                    <td style="color: #58a6ff; font-weight: 600;" th:text="'₹' + ${g.totalAmount}"></td>
                    <td style="color: #8b949e;" th:text="${g.receiptNotes}"></td>
                </tr>
            </table>
        </div>
    </div>
</body>
</html>
```

Create `src/main/resources/data.sql`:
```sql
-- Demo seed data for College PBL Viva Demonstration
-- Seed user with password 'password123' (BCrypt hash)
INSERT INTO users (user_id, full_name, email, password_hash)
VALUES (1, 'Rithish Kumar', 'demo@smartledger.local', '$2a$10$eE04wW52gqW9YJg9Y4W91.oUvjJ9jW.832c3f5g5r2.u3W0j0w4aG')
ON DUPLICATE KEY UPDATE user_id=user_id;

-- Seed Electricity records showcasing Progressive Slabs and Fair Split
INSERT INTO electricity_records (record_id, user_id, billing_month, master_eb_units, total_eb_amount, is_shared, my_submeter_units, other_submeter_units, calculated_my_share, paid_date)
VALUES (1, 1, '2026-08', 350.0, 950.0, true, 140.0, 210.0, 380.0, '2026-08-15'),
       (2, 1, '2026-09', 420.0, 1265.0, true, 180.0, 240.0, 542.14, '2026-09-15')
ON DUPLICATE KEY UPDATE record_id=record_id;

-- Seed LPG records showcasing finished cylinder burn rate and active cylinder countdown
INSERT INTO gas_records (cylinder_id, user_id, cylinder_weight_kg, booking_cost, connected_date, finished_date, burn_rate_per_day, is_active)
VALUES (1, 1, 14.2, 850.0, '2026-07-01', '2026-08-05', 0.4057, false),
       (2, 1, 14.2, 850.0, '2026-08-06', NULL, NULL, true)
ON DUPLICATE KEY UPDATE cylinder_id=cylinder_id;

-- Seed Telecom records showcasing active, expiring soon, and blackout statuses
INSERT INTO telecom_records (recharge_id, user_id, family_member_name, service_provider, plan_amount, recharge_date, validity_days, expiry_date)
VALUES (1, 1, 'Rithish (Self)', 'Jio', 719.0, '2026-08-01', 84, '2026-10-24'),
       (2, 1, 'Mom', 'Airtel', 299.0, '2026-08-27', 28, '2026-09-24'),
       (3, 1, 'Dad', 'BSNL', 199.0, '2026-08-10', 30, '2026-09-09')
ON DUPLICATE KEY UPDATE recharge_id=recharge_id;

-- Seed Transport records showcasing vehicle mileage and public transit
INSERT INTO transport_records (trip_id, user_id, commute_type, person_name, origin_point, destination_point, distance_km, liters_filled, total_fare_cost, mileage_calculated, cost_per_km, entry_date)
VALUES (1, 1, 'FUEL', 'Rithish', 'Home', 'College Campus', 45.0, 2.5, 255.0, 18.0, 5.67, '2026-09-18'),
       (2, 1, 'PUBLIC_TICKET', 'Rithish', 'Home', 'City Center', 25.0, NULL, 40.0, NULL, 1.60, '2026-09-20')
ON DUPLICATE KEY UPDATE trip_id=trip_id;

-- Seed Grocery records showcasing essential vs discretionary categories
INSERT INTO grocery_records (grocery_id, user_id, store_name, category, total_amount, purchase_date, receipt_notes)
VALUES (1, 1, 'Reliance Fresh', 'ESSENTIAL_STAPLE', 1450.0, '2026-09-10', 'Rice 10kg, Wheat flour 5kg, Dal 2kg'),
       (2, 1, 'Daily Dairy', 'DAIRY_PRODUCE', 380.0, '2026-09-15', 'Milk, curd, butter'),
       (3, 1, 'Sweet Shop', 'SNACKS_DISCRETIONARY', 350.0, '2026-09-18', 'Gulab jamun, mixture')
ON DUPLICATE KEY UPDATE grocery_id=grocery_id;
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```powershell
mvn test -Dtest=ViewControllerTest
```
Expected: PASS (3 tests run, 0 failures, 0 errors).

- [ ] **Step 5: Commit**

```powershell
git add src/main/resources/static/css/ src/main/resources/templates/ src/main/resources/data.sql src/main/java/com/smartledger/controller/AuthController.java src/main/java/com/smartledger/controller/ViewController.java src/test/java/com/smartledger/controller/ViewControllerTest.java
git commit -m "feat: implement glassmorphic UI, Thymeleaf views, and demo seed data"
```

---

### Task 11: End-to-End Test Suite Execution & Integration Verification

**Files:**
- Test: `src/test/java/com/smartledger/SmartLedgerApplicationTests.java`
- Modify: `src/test/java/com/smartledger/SmartLedgerIntegrationTest.java`

**Interfaces:**
- Consumes: Complete application suite
- Produces: 100% green JUnit 5 test suite across domain, algorithms, services, and web controllers.

- [ ] **Step 1: Write integration test exercising complete user journey**

Create `src/test/java/com/smartledger/SmartLedgerIntegrationTest.java`:
```java
package com.smartledger;

import com.smartledger.domain.CommuteType;
import com.smartledger.domain.GroceryCategory;
import com.smartledger.domain.User;
import com.smartledger.dto.MacroSpendSummaryDto;
import com.smartledger.service.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@TestPropertySource(locations = "classpath:application-test.properties")
@Transactional
class SmartLedgerIntegrationTest {

    @Autowired
    private UserService userService;
    @Autowired
    private ElectricityService electricityService;
    @Autowired
    private GasService gasService;
    @Autowired
    private TelecomService telecomService;
    @Autowired
    private TransportService transportService;
    @Autowired
    private GroceryService groceryService;
    @Autowired
    private DashboardSummaryService dashboardSummaryService;

    @Test
    void shouldExecuteCompleteUserJourneyAcrossAllFiveUtilityPillars() {
        // 1. Register user
        User user = userService.registerUser("Test User", "test@smartledger.local", "Password123!");
        assertThat(user.getUserId()).isNotNull();

        // 2. Electricity Fair Split (Master 350 units @ 950 total, my 140 / 350 -> share 380)
        var elec = electricityService.addRecord(user, "2026-09", 350.0, 140.0, 210.0, LocalDate.now());
        assertThat(elec.getCalculatedMyShare()).isEqualTo(380.0);

        // 3. Connect Gas Cylinder
        var gas = gasService.connectNewCylinder(user, 14.2, 850.0, LocalDate.now());
        assertThat(gas.getIsActive()).isTrue();

        // 4. Telecom recharge
        var telecom = telecomService.addRecharge(user, "Mom", "Airtel", 299.0, LocalDate.now(), 28);
        assertThat(telecom.getRecordId()).isNotNull();

        // 5. Transport Commute
        var trip = transportService.addTrip(user, CommuteType.FUEL, "Tester", "Home", "Campus", 45.0, 2.5, 255.0, LocalDate.now());
        assertThat(trip.getMileageCalculated()).isEqualTo(18.0);

        // 6. Grocery purchase
        var grocery = groceryService.addRecord(user, "Mart", GroceryCategory.ESSENTIAL_STAPLE, 500.0, LocalDate.now(), "Staples");
        assertThat(grocery.getTotalAmount()).isEqualTo(500.0);

        // 7. Macro Household Breakdown
        MacroSpendSummaryDto macro = dashboardSummaryService.getMacroBreakdown(user);
        assertThat(macro.totalMonthlySpend()).isEqualTo(380.0 + 850.0 + 299.0 + 255.0 + 500.0);
    }
}
```

- [ ] **Step 2: Run all unit and integration tests**

Run:
```powershell
mvn test
```
Expected: BUILD SUCCESS (All tests pass with 0 failures, 0 errors).

- [ ] **Step 3: Commit**

```powershell
git add src/test/java/com/smartledger/SmartLedgerIntegrationTest.java
git commit -m "test: add comprehensive end-to-end integration test verifying complete user journey"
```
