import bcrypt from 'bcrypt';

export const hashPassword = async (password) => {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

export const validatePassword = (password) => {
    if (password.length < 6) {
        return 'Пароль должен содержать минимум 6 символов';
    }
    return null;
};