from extensions import bcrypt


def hash_password(password):
    return bcrypt.generate_password_hash(password).decode("utf-8")


def check_password(stored_password, input_password):
    return bcrypt.check_password_hash(stored_password, input_password)
