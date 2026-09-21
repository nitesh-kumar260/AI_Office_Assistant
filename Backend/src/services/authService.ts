import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUser, UserRole } from '../models/User';

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || !secret.trim()) {
    throw new Error('Server configuration error: JWT_SECRET environment variable is missing');
  }
  return secret.trim();
}

export function sanitizeUser(user: IUser): Record<string, any> {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete (obj as any).passwordHash;
  delete (obj as any).__v;
  return obj;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: string;
  title?: string;
  organization?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  token: string;
  user: Record<string, any>;
}

export class AuthService {
  static async register(input: RegisterInput): Promise<AuthResult> {
    const { name, email, password, role, title, organization } = input;

    if (!name || !name.trim()) {
      throw new Error('Name is required');
    }

    if (!email || !email.trim()) {
      throw new Error('Email is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedEmail = email.trim().toLowerCase();
    if (!emailRegex.test(normalizedEmail)) {
      throw new Error('Invalid email format');
    }

    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new Error('Email is already registered');
    }

    // Do not blindly trust client-supplied elevated roles.
    // Standard public registration forces non-admin role ('legal' by default)
    let assignedRole: UserRole = 'legal';
    const validRoles: UserRole[] = ['legal', 'executive', 'auditor'];
    if (role && validRoles.includes(role as UserRole) && role !== 'admin') {
      assignedRole = role as UserRole;
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: assignedRole,
      title: title ? title.trim() : 'Legal Specialist',
      organization: organization ? organization.trim() : 'Ornitech Intelligence Labs',
      workspaces: [],
    });

    const secret = getJwtSecret();
    const token = jwt.sign(
      {
        userId: newUser._id.toString(),
        email: newUser.email,
        role: newUser.role,
      },
      secret,
      { expiresIn: '7d' }
    );

    return {
      token,
      user: sanitizeUser(newUser),
    };
  }

  static async login(input: LoginInput): Promise<AuthResult> {
    const { email, password } = input;

    if (!email || !email.trim()) {
      throw new Error('Email is required');
    }

    if (!password) {
      throw new Error('Password is required');
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Must explicitly select passwordHash since select: false in schema
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
    if (!user || !user.passwordHash) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const secret = getJwtSecret();
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      secret,
      { expiresIn: '7d' }
    );

    return {
      token,
      user: sanitizeUser(user),
    };
  }
}

export default AuthService;
