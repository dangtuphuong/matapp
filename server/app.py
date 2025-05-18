from flask import Flask, send_from_directory, render_template
from extensions import mongo, jwt, bcrypt, cors
from config import Config
from routes.user_routes import user_bp
from routes.material_routes import material_bp
from routes.category_routes import category_bp
from routes.property_routes import property_bp
from routes.setting_routes import setting_bp

from routes.upload.material import upload_bp

from routes.machine_learning.vectorSearch import vt_bp
from routes.machine_learning.llmSearch import ml_bp
from routes.machine_learning.deepseek_search import deepseek_bp
from routes.machine_learning.gemini_search import gemini_bp


def create_app():
    app = Flask(
        __name__,
        static_url_path="",
        static_folder="build",
        template_folder="build",
    )
    app.config.from_object(Config)

    # Initialize extensions
    mongo.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    cors.init_app(app)

    # Register Blueprints
    app.register_blueprint(user_bp, url_prefix="/api")
    app.register_blueprint(material_bp, url_prefix="/api")
    app.register_blueprint(setting_bp, url_prefix="/api")
    app.register_blueprint(vt_bp, url_prefix="/api")
    app.register_blueprint(ml_bp, url_prefix="/api")
    app.register_blueprint(category_bp, url_prefix="/api")
    app.register_blueprint(property_bp, url_prefix="/api")
    app.register_blueprint(upload_bp, url_prefix="/api")
    app.register_blueprint(deepseek_bp, url_prefix="/api")
    app.register_blueprint(gemini_bp, url_prefix="/api")

    # Flask Health Check Endpoint
    @app.route("/healthz")
    def healthz():
        return "OK", 200

    # Client (React) route
    @app.route("/")
    def index():
        return send_from_directory(app.static_folder, "index.html")

    @app.errorhandler(404)
    def not_found(e):
        return render_template("index.html")

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
