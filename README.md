## Material Selection Application

#### Tech Stack

- **Frontend**: React
- **Backend**: Python + Flask
- **AI/ML**: Sentence Transformer, OpenAI, DeepSeek, Google Gemini
- **Database**: MongoDB

## Installation & Setup

### 1. Clone the project repository

```bash
git clone https://github.com/dangtuphuong/matapp.git
cd matapp
```

### 2. Client - Install Dependencies:

```bash
cd client

npm install
```

### 3. Server - Set Up a Virtual Environment and Install Dependencies:

#### For Windows:

```bash
cd server

python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

#### For Mac:

```bash
cd server

python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 4. Database - Setup

Make sure the MongoDB service is running  
Create a database named `matdb`

### 5. Environment Variables

Create a .env file inside the server/ directory with the following:

```
MONGO_URI=your_mongo_uri
JWT_SECRET_KEY=your_jwt_secret
GOOGLE_API_KEY=your_google_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key
OPENAI_API_KEY=your_openai_api_key
```

## Running the Application

Start the backend server:

```bash
# Make sure you are in the server directory and the virtual environment is activated
python app.py
```

Start the frontend in development mode:

```bash
# Open a new terminal and make sure you are in the client directory
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
