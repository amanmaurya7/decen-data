# Decentralized Data Keeper: Project Documentation

## Project Overview

The Decentralized Data Keeper is a web application designed to securely store and manage files using IPFS (InterPlanetary File System) and blockchain technology. The project focuses on enhancing data privacy, security, and ownership through decentralized storage solutions.

## 1. Topic Finalization and Problem Definition

### Project Title
Decentralized Data Keeper

### Problem Statement
Traditional centralized storage systems face several challenges:
- Single points of failure leading to potential data loss
- Vulnerability to censorship and unauthorized access
- Limited control over personal data
- Lack of transparency in data handling processes
- Reliance on third-party service providers

### Project Goals
- Create a decentralized file storage system using IPFS
- Implement file encryption for enhanced security
- Enable file sharing with specific blockchain addresses
- Provide a user-friendly interface for file management
- Ensure data ownership and control remains with users

## 2. Literature Survey on Software Modeling

### Evaluated Software Development Models

#### 1. Waterfall Model
- **Description**: Sequential design process flowing through phases
- **Advantages**: Simple structure, well-documented
- **Disadvantages**: Inflexible, late testing, high risk

#### 2. Agile Methodology
- **Description**: Iterative approach with continuous feedback
- **Advantages**: Adaptable to changes, continuous delivery
- **Disadvantages**: Less predictable, requires active client participation

#### 3. Scrum Framework
- **Description**: Agile framework with fixed-length iterations
- **Advantages**: Regular deliverables, team accountability
- **Disadvantages**: Requires experienced team, complex for simple projects

#### 4. DevOps Model
- **Description**: Integration of development and operations
- **Advantages**: Continuous integration/deployment, faster delivery
- **Disadvantages**: Cultural shift required, implementation complexity

#### 5. Spiral Model
- **Description**: Risk-driven approach with repeated cycles
- **Advantages**: Risk assessment at each phase, good for large projects
- **Disadvantages**: Complex, costly, time-consuming

**Selected Model**: Agile Methodology with specific blockchain-oriented adaptations to handle the decentralized nature of the application.

## 3. Design Experiment - Technical Article

# Agile Blockchain Development Methodology: Adapting Agile for Decentralized Applications

## Introduction

The intersection of blockchain technology and software development presents unique challenges that traditional development methodologies struggle to address effectively. This article explores how the Agile methodology can be adapted specifically for blockchain-based decentralized applications, focusing on the Decentralized Data Keeper project as a case study.

## Methodology Name: Agile Blockchain Development Methodology (ABDM)

### Description

The Agile Blockchain Development Methodology (ABDM) is an adaptation of traditional Agile practices tailored specifically to address the unique challenges of developing decentralized applications. ABDM retains the core principles of Agile—iterative development, continuous feedback, and adaptability—while introducing specialized practices to accommodate blockchain-specific considerations such as immutability, consensus mechanisms, and distributed architecture.

ABDM follows these key principles:

1. **Iterative Smart Contract Development**: Smart contracts are developed incrementally, with each iteration subjected to rigorous testing before deployment due to their immutable nature.

2. **Continuous Security Validation**: Security-focused code reviews and automated testing are integrated throughout the development cycle, not just at the end.

3. **Cross-Domain Collaboration**: Development teams include not only software engineers but also cryptography experts, economists, and blockchain specialists.

4. **User-Centric Design with Blockchain Constraints**: User experience design considers the inherent constraints of blockchain technology (like transaction confirmation times) while maintaining usability.

5. **Testnet-Driven Development**: Features are deployed and tested on blockchain testnets before mainnet deployment.

### When and Why ABDM is Used

ABDM is particularly suitable for projects that:

1. **Involve Immutable Code Deployment**: Once deployed on blockchain, smart contracts cannot be easily modified, making thorough testing and validation crucial.

2. **Require Consensus-Based Validation**: Applications that rely on distributed consensus mechanisms need specialized testing approaches.

3. **Intersect Traditional and Blockchain Technologies**: Projects bridging conventional web technologies with blockchain components, like our Decentralized Data Keeper.

4. **Face Evolving Regulatory Landscapes**: Blockchain projects often operate in uncertain regulatory environments that may require rapid adaptations.

5. **Need Continuous Integration with Blockchain Infrastructure**: Projects that must maintain compatibility with evolving blockchain protocols and standards.

The Decentralized Data Keeper project employs ABDM because it combines traditional web interface development with decentralized storage on IPFS and potential blockchain-based access control. This hybrid nature requires the flexibility of Agile while addressing blockchain-specific concerns.

### Advantages of ABDM

1. **Risk Mitigation**: The iterative approach reduces the risk of deploying flawed smart contracts that cannot be easily modified.

2. **Adaptability to Technological Changes**: The blockchain ecosystem evolves rapidly; ABDM allows projects to adapt to new protocols and standards.

3. **Early Identification of Technical Constraints**: Blockchain-specific limitations are identified early in the development process.

4. **Enhanced Security Focus**: Security is treated as a core feature rather than an afterthought, crucial for blockchain applications.

5. **Balanced Stakeholder Participation**: All stakeholders, including developers, users, and blockchain infrastructure providers, have input throughout the development process.

### Disadvantages of ABDM

1. **Increased Technical Complexity**: The need to account for blockchain-specific concerns adds complexity to the development process.

2. **Higher Initial Resource Requirements**: Cross-domain expertise and additional testing infrastructure increase initial costs.

3. **Longer Initial Development Cycles**: The rigorous testing required before smart contract deployment can extend early development phases.

4. **Limited Historical Data**: As a relatively new methodology, there are fewer case studies and established best practices.

5. **Greater Coordination Challenges**: Managing distributed development teams with diverse expertise requires additional coordination efforts.

## Conclusion

The Agile Blockchain Development Methodology represents a necessary evolution of traditional Agile practices to address the unique challenges of blockchain application development. For projects like the Decentralized Data Keeper, ABDM provides a structured yet flexible approach that acknowledges both the immutable nature of blockchain deployments and the need for iterative improvement.

As the blockchain space continues to mature, we can expect further refinement of ABDM and the emergence of specialized tools and practices that support this methodology. Organizations adopting ABDM will likely gain competitive advantages through more secure, adaptable, and user-centered blockchain applications.

## 4. Software Requirements Specification (SRS)

# Software Requirements Specification (SRS)
## Decentralized Data Keeper

### 1. Introduction

#### 1.1 Purpose
This document specifies the software requirements for the Decentralized Data Keeper application. It describes the functionality, external interfaces, performance requirements, and design constraints.

#### 1.2 Scope
The Decentralized Data Keeper is a web application enabling users to:
- Upload files to decentralized storage (IPFS)
- Encrypt files before storage
- Share access to files with specific Ethereum addresses
- Download shared files
- Manage file access permissions
- Delete files from both blockchain references and IPFS storage

#### 1.3 Definitions, Acronyms, and Abbreviations
- **IPFS**: InterPlanetary File System, a protocol designed to create a decentralized method of storing and sharing files
- **Pinata**: A service that pins content to the IPFS network
- **MetaMask**: A cryptocurrency wallet and gateway to blockchain applications
- **DApp**: Decentralized Application
- **SRS**: Software Requirements Specification

#### 1.4 References
- IPFS Documentation: https://docs.ipfs.tech/
- Pinata API Documentation: https://docs.pinata.cloud/
- Ethereum Documentation: https://ethereum.org/developers/docs/

#### 1.5 Overview
The subsequent sections of this document provide a general description of the product, specific requirements, and additional considerations.

### 2. Overall Description

#### 2.1 Product Perspective
The Decentralized Data Keeper is a standalone web application that interfaces with:
- IPFS via Pinata API for decentralized storage
- Ethereum blockchain for user authentication and access control
- Web browsers for the user interface

#### 2.2 Product Functions
- User authentication via Ethereum wallet
- File upload to IPFS with optional encryption
- File download from IPFS with decryption
- File sharing with specific Ethereum addresses
- Access control management
- File deletion with removal from both blockchain references and IPFS

#### 2.3 User Characteristics
The intended users are individuals who:
- Have basic familiarity with blockchain technology
- Possess an Ethereum wallet (e.g., MetaMask)
- Need secure, decentralized file storage
- Wish to maintain control over their data
- Want to share files securely with specific individuals

#### 2.4 Constraints
- Requires users to have an Ethereum wallet installed
- Relies on third-party API (Pinata) for IPFS interactions
- Limited by blockchain transaction speeds and costs
- Browser compatibility constraints
- Network connectivity required for all operations

#### 2.5 Assumptions and Dependencies
- Users have access to an Ethereum wallet
- Pinata API is available and functioning
- Browser supports Web3 interactions
- Network connectivity is available for blockchain and IPFS interactions

### 3. Specific Requirements

#### 3.1 External Interface Requirements

##### 3.1.1 User Interfaces
- **Connect Wallet Screen**: Interface for connecting Ethereum wallet
- **File Upload Interface**: Form for selecting and uploading files
- **File List View**: Display of user's files with management options
- **File Sharing Dialog**: Interface for managing file access permissions
- **Network Status Indicator**: Display of current blockchain network

##### 3.1.2 Hardware Interfaces
- Desktop, laptop, or mobile device with web browser
- Internet connectivity

##### 3.1.3 Software Interfaces
- Web browser with JavaScript enabled
- Ethereum wallet extension (e.g., MetaMask)
- IPFS interaction via Pinata API

##### 3.1.4 Communications Interfaces
- HTTP/HTTPS for web application access
- JSON-RPC for Ethereum blockchain communication
- REST API calls to Pinata service

#### 3.2 Functional Requirements

##### 3.2.1 Authentication
- **FR1.1**: System shall allow users to connect their Ethereum wallet
- **FR1.2**: System shall verify wallet connection status before allowing access
- **FR1.3**: System shall display the connected wallet address

##### 3.2.2 File Upload
- **FR2.1**: System shall allow users to select files from their device
- **FR2.2**: System shall support drag-and-drop file selection
- **FR2.3**: System shall encrypt files before uploading (optional)
- **FR2.4**: System shall upload files to IPFS via Pinata
- **FR2.5**: System shall store file metadata on blockchain
- **FR2.6**: System shall display upload progress and confirmation

##### 3.2.3 File Management
- **FR3.1**: System shall display a list of user's files
- **FR3.2**: System shall show file details (name, size, type, upload date)
- **FR3.3**: System shall indicate file ownership and access status
- **FR3.4**: System shall allow file deletion with confirmation
- **FR3.5**: System shall remove deleted files from both blockchain references and IPFS

##### 3.2.4 File Sharing
- **FR4.1**: System shall allow owners to share files with specific Ethereum addresses
- **FR4.2**: System shall display current viewers of each file
- **FR4.3**: System shall allow revoking access for specific addresses
- **FR4.4**: System shall update access permissions on blockchain

##### 3.2.5 File Download
- **FR5.1**: System shall allow download of files the user has access to
- **FR5.2**: System shall retrieve files from IPFS
- **FR5.3**: System shall decrypt files if necessary
- **FR5.4**: System shall handle download errors gracefully

#### 3.3 Performance Requirements
- File upload time shall depend primarily on file size and network conditions
- Web interface shall be responsive and mobile-friendly
- Application shall handle concurrent users independently
- Blockchain transactions shall be completed within network-standard timeframes

#### 3.4 Design Constraints
- Development using React and TypeScript
- Responsive design for various screen sizes
- Compliance with Web3 standards
- IPFS interaction through Pinata API
- Secure implementation of cryptographic features

#### 3.5 Software System Attributes

##### 3.5.1 Reliability
- Consistent file storage and retrieval
- Proper error handling and recovery
- Verification of blockchain transactions

##### 3.5.2 Security
- File encryption before storage
- Blockchain-based access control
- Secure API interactions

##### 3.5.3 Maintainability
- Modular code architecture
- Comprehensive documentation
- Use of standard libraries and frameworks

##### 3.5.4 Portability
- Cross-browser compatibility
- Responsive design for different devices
- Standard web technologies (HTML5, CSS3, JavaScript)

#### 3.6 Other Requirements
- Support for multiple file types
- Customizable user preferences
- File preview capabilities (future enhancement)

## 5 & 7. Use Case and Gantt Chart Development

### Use Case Diagram

The use case diagram for the Decentralized Data Keeper includes the following actors and use cases:

**Actors:**
- File Owner (Ethereum wallet user)
- File Viewer (Shared access recipient)

**Use Cases:**
1. Connect Wallet
2. Upload File
3. View Files
4. Download File
5. Share File Access
6. Revoke File Access
7. Delete File

```
+-----------------------------------+
|     Decentralized Data Keeper     |
+-----------------------------------+
                  |
       +----------+-----------+
       |                      |
       v                      v
+-------------+       +----------------+
| File Owner  |       |  File Viewer   |
+-------------+       +----------------+
       |                      |
       |                      |
       +-> Connect Wallet <---+
       |                      |
       +--> Upload File       |
       |                      |
       +--> View Files <------+
       |                      |
       +--> Download File <---+
       |                      |
       +--> Share File Access |
       |                      |
       +--> Revoke Access     |
       |                      |
       +--> Delete File       |
```

### Gantt Chart

Below is a simplified Gantt chart for the development of the Decentralized Data Keeper:

```
Week 1  |==== Project Setup & Requirements Analysis ====|
Week 2  |==== UI Design & Component Development =====|
Week 3  |======== IPFS Integration =========|
Week 4  |======= Blockchain Connection =======|
Week 5  |====== File Upload/Download Logic =====|
Week 6  |====== Access Control & Sharing ======|
Week 7  |======= Testing & Bug Fixes =======|
Week 8  |== Deployment & Documentation ==|
```

**Detailed Timeline:**

1. **Project Setup & Requirements Analysis (Week 1)**
   - Environment setup
   - Requirements gathering
   - Technology selection
   - Architecture design

2. **UI Design & Component Development (Week 2)**
   - Design wireframes
   - Create responsive layout
   - Develop core components
   - Implement basic navigation

3. **IPFS Integration (Week 3)**
   - Implement Pinata API connection
   - Develop file upload logic
   - Create file download functionality
   - Test IPFS interactions

4. **Blockchain Connection (Week 4)**
   - Implement wallet connection
   - Develop blockchain utilities
   - Create contract interaction methods
   - Test blockchain functionality

5. **File Upload/Download Logic (Week 5)**
   - Implement file encryption
   - Develop file decryption
   - Create file metadata handling
   - Test end-to-end file operations

6. **Access Control & Sharing (Week 6)**
   - Implement sharing functionality
   - Develop access control logic
   - Create permission management interface
   - Test sharing and permissions

7. **Testing & Bug Fixes (Week 7)**
   - Conduct unit testing
   - Perform integration testing
   - User acceptance testing
   - Fix identified bugs

8. **Deployment & Documentation (Week 8)**
   - Prepare deployment environment
   - Deploy application
   - Complete documentation
   - Knowledge transfer

## 6 & 8. Data Flow Diagram and Project Cost Estimation

### Data Flow Diagram

#### Level 0 DFD (Context Diagram)
```
+------------------+
|                  |       Upload/Download        +--------------+
|      User        | <------------------------>  |              |
| (Ethereum Wallet)|                             | Decentralized|
|                  |       Access Management      |  Data Keeper |
+------------------+ <------------------------>  |              |
                                                 +--------------+
                                                       ^
                                                       |
                                                       v
                                                 +--------------+
                                                 |              |
                                                 | IPFS Network |
                                                 | (via Pinata) |
                                                 |              |
                                                 +--------------+
```

#### Level 1 DFD
```
                  +-------------------+
                  |                   |
 +--------+       | Authentication    |       +----------+
 |        | ----> | Process           | ----> |          |
 | User   |       |                   |       | Ethereum |
 |        | <---- +-------------------+       | Network  |
 +--------+                ^                  |          |
     |                     |                  +----------+
     v                     |
+-------------+    +-------------------+
|             |    |                   |         +----------+
| File Upload | -> | File Management   | ------> |          |
| Process     |    | Process           |         | IPFS     |
|             |    |                   | <------ | Network  |
+-------------+    +-------------------+         |          |
                          ^   |                  +----------+
                          |   |
                          |   v
                   +-------------------+
                   |                   |
                   | Access Control    |
                   | Process           |
                   |                   |
                   +-------------------+
```

### Project Cost Estimation

#### Development Costs

| Resource                         | Rate (USD)      | Time      | Cost (USD)    |
|----------------------------------|-----------------|-----------|---------------|
| Frontend Developer               | $50/hour        | 160 hours | $8,000        |
| Blockchain Developer             | $70/hour        | 100 hours | $7,000        |
| UI/UX Designer                   | $40/hour        | 40 hours  | $1,600        |
| Quality Assurance                | $40/hour        | 60 hours  | $2,400        |
| Project Manager                  | $60/hour        | 40 hours  | $2,400        |
| **Subtotal: Development**        |                 |           | **$21,400**   |

#### Infrastructure & Services

| Item                             | Cost (USD)      | Duration  | Total (USD)   |
|----------------------------------|-----------------|-----------|---------------|
| IPFS Pinning Service (Pinata)    | $20/month      | 12 months | $240          |
| Domain Name                      | $15/year       | 1 year    | $15           |
| Hosting (Vercel Premium)         | $20/month      | 12 months | $240          |
| SSL Certificate                  | $0 (Let's Encrypt) | 1 year | $0            |
| **Subtotal: Infrastructure**     |                 |           | **$495**      |

#### Testing & Deployment

| Item                             | Cost (USD)      |
|----------------------------------|-----------------|
| Smart Contract Audit             | $3,000          |
| Security Testing                 | $1,500          |
| Performance Testing              | $800            |
| Deployment & DevOps              | $1,200          |
| **Subtotal: Testing & Deployment**|                | **$6,500** |

#### Miscellaneous

| Item                             | Cost (USD)      |
|----------------------------------|-----------------|
| Software Licenses                | $300            |
| Contingency (10%)                | $2,870          |
| **Subtotal: Miscellaneous**      |                 | **$3,170** |

#### Total Project Cost

| Category                         | Cost (USD)      |
|----------------------------------|-----------------|
| Development                      | $21,400         |
| Infrastructure & Services        | $495            |
| Testing & Deployment             | $6,500          |
| Miscellaneous                    | $3,170          |
| **Total Project Cost**           |                 | **$31,565** |

## 9. Test Cases for Testing

### 1. Wallet Connection Test Cases

#### TC-WC-001: Connect Valid Ethereum Wallet
- **Description**: Test connecting a valid Ethereum wallet to the application
- **Preconditions**: User has MetaMask installed with a valid account
- **Test Steps**:
  1. Navigate to application homepage
  2. Click "Connect Wallet" button
  3. Approve connection in MetaMask
- **Expected Result**: Application displays connected wallet address and enables application features
- **Actual Result**: [To be filled during testing]
- **Status**: [Pass/Fail]

#### TC-WC-002: Connect Wallet on Unsupported Network
- **Description**: Test application behavior when connecting to unsupported network
- **Preconditions**: User has MetaMask installed with network set to an unsupported chain
- **Test Steps**:
  1. Navigate to application homepage
  2. Click "Connect Wallet" button
  3. Approve connection in MetaMask
- **Expected Result**: Application detects wrong network, prompts user to switch to supported network
- **Actual Result**: [To be filled during testing]
- **Status**: [Pass/Fail]

#### TC-WC-003: Disconnect Wallet
- **Description**: Test disconnecting wallet from application
- **Preconditions**: User has wallet connected to application
- **Test Steps**:
  1. Click on wallet address or disconnect button
  2. Confirm disconnection if prompted
- **Expected Result**: Application returns to disconnected state, limited functionality
- **Actual Result**: [To be filled during testing]
- **Status**: [Pass/Fail]

### 2. File Upload Test Cases

#### TC-FU-001: Upload File via Button
- **Description**: Test uploading a file using the file selection button
- **Preconditions**: User has connected wallet and is on main application page
- **Test Steps**:
  1. Click "Browse Files" button
  2. Select a valid file (e.g., PDF, less than 10MB)
  3. Click "Upload" button
- **Expected Result**: File uploads successfully, appears in file list
- **Actual Result**: [To be filled during testing]
- **Status**: [Pass/Fail]

#### TC-FU-002: Upload File via Drag and Drop
- **Description**: Test uploading a file using drag and drop functionality
- **Preconditions**: User has connected wallet and is on main application page
- **Test Steps**:
  1. Drag a file from file explorer
  2. Drop onto the designated drop area
  3. Click "Upload" button
- **Expected Result**: File uploads successfully, appears in file list
- **Actual Result**: [To be filled during testing]
- **Status**: [Pass/Fail]

#### TC-FU-003: Upload Large File
- **Description**: Test application behavior with large file upload
- **Preconditions**: User has connected wallet and is on main application page
- **Test Steps**:
  1. Select a large file (e.g., 50MB+)
  2. Click "Upload" button
- **Expected Result**: Application displays appropriate warning or handles upload with progress indicator
- **Actual Result**: [To be filled during testing]
- **Status**: [Pass/Fail]

### 3. File Download Test Cases

#### TC-FD-001: Download Owned File
- **Description**: Test downloading a file owned by the user
- **Preconditions**: User has uploaded at least one file
- **Test Steps**:
  1. Locate the file in the file list
  2. Click the download button for the file
- **Expected Result**: File downloads successfully to user's device
- **Actual Result**: [To be filled during testing]
- **Status**: [Pass/Fail]

#### TC-FD-002: Download Shared File
- **Description**: Test downloading a file shared with the user
- **Preconditions**: Another user has shared a file with the current user
- **Test Steps**:
  1. Locate the shared file in the file list
  2. Click the download button for the file
- **Expected Result**: File downloads successfully to user's device
- **Actual Result**: [To be filled during testing]
- **Status**: [Pass/Fail]

### 4. File Sharing Test Cases

#### TC-FS-001: Share File with Valid Ethereum Address
- **Description**: Test sharing a file with a valid Ethereum address
- **Preconditions**: User owns at least one file
- **Test Steps**:
  1. Locate owned file in file list
  2. Click share button
  3. Enter valid Ethereum address
  4. Click "Add" button
- **Expected Result**: Address is added to file's viewers list
- **Actual Result**: [To be filled during testing]
- **Status**: [Pass/Fail]

#### TC-FS-002: Attempt to Share with Invalid Address
- **Description**: Test application behavior when sharing with invalid address
- **Preconditions**: User owns at least one file
- **Test Steps**:
  1. Locate owned file in file list
  2. Click share button
  3. Enter invalid Ethereum address (e.g., missing characters)
  4. Click "Add" button
- **Expected Result**: Application displays error message, does not add address to viewers
- **Actual Result**: [To be filled during testing]
- **Status**: [Pass/Fail]

#### TC-FS-003: Revoke Access from Shared User
- **Description**: Test revoking access from a previously shared user
- **Preconditions**: User has shared a file with at least one address
- **Test Steps**:
  1. Locate owned file in file list
  2. Click share button
  3. Find shared address in viewers list
  4. Click remove/revoke button for that address
- **Expected Result**: Address is removed from file's viewers list
- **Actual Result**: [To be filled during testing]
- **Status**: [Pass/Fail]

### 5. File Deletion Test Cases

#### TC-FD-001: Delete Owned File
- **Description**: Test deleting a file owned by the user
- **Preconditions**: User owns at least one file
- **Test Steps**:
  1. Locate owned file in file list
  2. Click delete button
  3. Confirm deletion in confirmation dialog
- **Expected Result**: File is removed from list and deleted from both blockchain reference and IPFS
- **Actual Result**: [To be filled during testing]
- **Status**: [Pass/Fail]

#### TC-FD-002: Attempt to Delete Shared File (Non-Owner)
- **Description**: Test application behavior when non-owner attempts to delete
- **Preconditions**: User has access to a shared file
- **Test Steps**:
  1. Locate shared file in file list
  2. Verify delete button is not present or disabled
- **Expected Result**: Delete functionality is not available for non-owners
- **Actual Result**: [To be filled during testing]
- **Status**: [Pass/Fail]

### 6. Security Test Cases

#### TC-SC-001: Access File Without Permission
- **Description**: Test application security when attempting to access unauthorized file
- **Preconditions**: Two users connected to application, one user has uploaded a file
- **Test Steps**:
  1. Second user attempts to access first user's file directly (e.g., by manipulating URL)
- **Expected Result**: Access denied, appropriate error message displayed
- **Actual Result**: [To be filled during testing]
- **Status**: [Pass/Fail]

#### TC-SC-002: Session Persistence After Page Reload
- **Description**: Test if wallet connection persists after page reload
- **Preconditions**: User has connected wallet to application
- **Test Steps**:
  1. Reload the application page
- **Expected Result**: Wallet remains connected, user can access their files
- **Actual Result**: [To be filled during testing]
- **Status**: [Pass/Fail]

### 7. User Interface Test Cases

#### TC-UI-001: Responsive Design on Mobile
- **Description**: Test application responsiveness on mobile devices
- **Preconditions**: None
- **Test Steps**:
  1. Access application on mobile device or using browser developer tools mobile emulation
  2. Navigate through all main screens
- **Expected Result**: All elements properly sized and positioned for mobile view
- **Actual Result**: [To be filled during testing]
- **Status**: [Pass/Fail]

#### TC-UI-002: Loading States Display
- **Description**: Test proper display of loading indicators during operations
- **Preconditions**: User has connected wallet
- **Test Steps**:
  1. Initiate file upload
  2. Observe interface during upload process
- **Expected Result**: Loading indicators shown during operations, buttons disabled where appropriate
- **Actual Result**: [To be filled during testing]
- **Status**: [Pass/Fail]

---

This documentation provides a comprehensive overview of the Decentralized Data Keeper project, from concept through development and testing. The document follows software engineering best practices and includes all the required sections for academic project documentation.
