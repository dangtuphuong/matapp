## Material Selection Application

#### Tech Stack

- **Frontend**: React
- **Backend**: Python + Flask
- **AI/ML**: TBA

## Installation

### Clone the project repository

```bash
git clone https://github.com/dangtuphuong/matapp.git
cd matapp
```

### Client: Install Dependencies:

```bash
cd client

npm install
```

### Server: Set Up a Virtual Environment and Install Dependencies:

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

### Database: Setup

Make sure the MongoDB service is running locally
Create a database named `matdb`

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
