# CSVImageCompressor
### Technical Design Document: Image Processing System with Webhook and Status API

---

### **Table of Contents**
1. **Introduction**
2. **System Architecture**
3. **Components and Their Roles**
4. **Data Flow**
5. **Database Schema**
6. **System Diagram**
7. **Conclusion**

---

### **1. Introduction**

The system is designed to handle the asynchronous processing of images from URLs provided in a CSV file. It compresses these images and provides the user with the ability to:
- Upload a CSV containing image URLs.
- Track the processing status using a unique `request ID`.
- Receive notifications via a webhook when the processing is complete.

### **2. System Architecture**

The system architecture is composed of three main APIs:
1. **Upload API**: Accepts a CSV file, validates it, stores the initial request with a `pending` status, and starts asynchronous image processing.
2. **Status API**: Allows users to check the current status of their processing request (e.g., `pending` or `complete`).
3. **Webhook API**: Allows the system to notify an external system when the image processing is complete.

---

### **3. Components and Their Roles**

#### **3.1. Upload API**
- **Role**: Accepts CSV files containing image URLs and an optional webhook URL.
- **Function**: 
  - Validates the CSV format.
  - Generates a unique `request ID`.
  - Stores the request in the database with an initial `pending` status.
  - Initiates the asynchronous image processing.
- **Endpoint**: `POST /upload`

#### **3.2. Status API**
- **Role**: Provides the current status of a particular processing job.
- **Function**:
  - Retrieves the status of the request using the `request ID`.
  - Returns the status (`pending` or `complete`) and, if complete, the path to the processed CSV file.
- **Endpoint**: `GET /status/:id`

#### **3.3. Webhook API**
- **Role**: Triggered when the image processing is complete to notify an external system.
- **Function**:
  - Sends a POST request to the provided webhook URL with a payload containing the `request ID`, status (`complete`), and the path to the processed CSV file.
  - This allows external systems to get notified when the task is complete without polling the status.

#### **3.4. Image Processing Service**
- **Role**: Asynchronously processes the images from the URLs provided in the CSV file.
- **Function**:
  - Downloads images from URLs.
  - Compresses them by 50% using **Sharp.js**.
  - Uploads the compressed images to **Cloudinary** and stores the output URLs.
  - Writes the processed output back into the CSV file.
  - Updates the status of the request to `complete` once all images are processed.

#### **3.5. Database**
- **Role**: Stores and manages request data (e.g., `request ID`, status, webhook URL, and output file path).
- **Function**:
  - Tracks the request status (pending or complete).
  - Stores the location of the output CSV file once processing is complete.
  - Stores the webhook URL for notifying external systems when processing is complete.

#### **3.6. Asynchronous Queue (Optional Enhancement)**
- **Role**: Manages tasks asynchronously and ensures that image processing is handled efficiently.
- **Function**:
  - The queue system (like **Bull.js** for Node.js) can be used to manage and scale the image processing jobs in the background.

---

### **4. Data Flow**

1. **CSV Upload**: The user uploads a CSV containing image URLs via the `Upload API`. Optionally, a webhook URL is provided. The system validates the CSV format and starts the image processing.
2. **Request Storage**: The system generates a unique `request ID` and stores it in the database with the status set to `pending`.
3. **Asynchronous Processing**: The image URLs are processed in the background. Images are downloaded, compressed, and re-uploaded to a service like **Cloudinary**. The output CSV is updated with the new URLs.
4. **Status Check**: The user can query the current status of the processing job via the `Status API`. Once the images are processed, the status changes to `complete`.
5. **Webhook Notification**: When the image processing is complete, if a webhook URL is provided, the system triggers the webhook and notifies the external system of the completion.
6. **CSV Output**: The system provides the path to the processed CSV file, which the user can download.

---

### **5. Database Schema**

The database contains a single table called `requests` that tracks the status of each processing job.

#### **Table: requests**

| Column          | Type    | Description                                                      |
|-----------------|---------|------------------------------------------------------------------|
| `id`            | INT     | Auto-incrementing primary key.                                   |
| `requestId`     | STRING  | Unique ID for each processing job.                               |
| `status`        | STRING  | Status of the job (e.g., `pending`, `complete`).                 |
| `webhookUrl`    | STRING  | Optional webhook URL for notification on job completion.         |
| `outputFilePath`| STRING  | Path to the output CSV file containing the processed image URLs.  |
| `created_at`    | TIMESTAMP | Timestamp of when the request was created.                     |
| `updated_at`    | TIMESTAMP | Timestamp of the last update (when status changed).            |

---

### **6. System Diagram**

Here’s a visual representation of the system architecture (using a tool like **Draw.io**):

#### **System Diagram Overview**

```plaintext
+---------------------------------------------------------+
|                     User System                         |
|                                                         |
|      +------------------+      +-------------------+    |
|      |  Upload CSV       | ---> |  Upload API       |    |
|      +------------------+      +-------------------+    |
|                                                         |
|      +------------------+      +-------------------+    |
|      |  Query Status     | ---> |  Status API       |    |
|      +------------------+      +-------------------+    |
|                                                         |
+---------------------------------------------------------+
                           |
                           |     +---------------------+
                           v     |  Async Processing   |
+---------------------------------------------------------+
|                                                         |
|       +---------------------+      +-----------------+ |
|       |  Image Processing    | ---> |  Cloudinary     | |
|       +---------------------+      +-----------------+ |
|                                                         |
+---------------------------------------------------------+
                           |
                           v
+---------------------------------------------------------+
|                       Database                          |
|      +------------------+      +-------------------+    |
|      |   Store Request   |      |  Track Status     |    |
|      +------------------+      +-------------------+    |
|                                                         |
+---------------------------------------------------------+
                           |
                           v
+---------------------------------------------------------+
|                     Webhook Flow                        |
|   +------------------+      +-----------------------+   |
|   |  Trigger Webhook  | ---> |  Notify External System|  |
|   +------------------+      +-----------------------+   |
|                                                         |
+---------------------------------------------------------+
```

---

### **7. Conclusion**

The system design ensures scalability, flexibility, and extensibility by making use of asynchronous processes and webhook-based notifications. The design handles large image processing tasks efficiently while allowing the user to check the status or be notified upon task completion.

The integration of asynchronous image processing and webhook functionality makes it a flexible system capable of handling real-time notifications and large workloads.

---

### Additional Considerations:
- **Error Handling**: Ensure that the system handles errors, such as failed image downloads or webhook failures.
- **Security**: Validate input (e.g., webhook URLs) to prevent potential vulnerabilities like SSRF attacks.
- **Scalability**: Use a queueing system to scale the image processing based on workload.

---

Let me know if you'd like further clarifications or if you need help with the diagram!
