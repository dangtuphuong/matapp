from flask import Flask
from extensions import mongo, jwt, bcrypt, cors
from config import Config
from routes.user_routes import user_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    mongo.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    cors.init_app(app)

    # Register Blueprints
    app.register_blueprint(user_bp, url_prefix="/api")

    # Test DB connection
    with app.app_context():
        try:
            mongo.cx.admin.command("ping")
            print("Pinged your deployment. Successfully connected to MongoDB!")
        except Exception as e:
            print(f"MongoDB connection error: {e}")

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
