import { Router } from 'express';
import { verifyJwt } from '../middlewares/auth.middleware.js';
import {
    registerUser,
    loginUser,
    logoutUser,
    changeCurrentPassword,
    refreshUserToken,
    getUserProfile,
    updateProfileData,
    deleteUser,
    verifyEmail,
    verifyPhone,
    sendemailVerificationToken,
    sendphoneVerificationToken,
} from '../controllers/user.controller.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - firstName
 *         - password
 *         - phone
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the user
 *         email:
 *           type: string
 *           format: email
 *           uniqueItems: true
 *           description: User's email address
 *         firstName:
 *           type: string
 *           description: User's first name
 *         lastName:
 *           type: string
 *           description: User's last name
 *         password:
 *           type: string
 *           format: password
 *           description: User's password (hashed before storage)
 *         phone:
 *           type: string
 *           uniqueItems: true
 *           description: User's phone number
 *         emailVerified:
 *           type: boolean
 *           default: false
 *           description: Email verification status
 *         phoneVerified:
 *           type: boolean
 *           default: false
 *           description: Phone verification status
 *         emailVerificationToken:
 *           type: string
 *           description: Token for email verification
 *         phoneVerificationToken:
 *           type: string
 *           description: Token for phone verification
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of user creation
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of last user update
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - email
 *               - password
 *               - confirmPassword
 *               - phone
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */
router.route('/register').post(registerUser);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       400:
 *         description: Invalid credentials
 */
router.route("/login").post(loginUser);

/**
 * @swagger
 * /api/users/tokens/refresh:
 *   post:
 *     summary: Refresh authentication tokens
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tokens refreshed successfully
 *       401:
 *         description: Invalid or expired token
 */
router.route("/tokens/refresh").post(refreshUserToken);

/**
 * @swagger
 * /api/users/logout:
 *   post:
 *     summary: User logout
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 */
router.route("/logout").post(verifyJwt, logoutUser);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *
 *   patch:
 *     summary: Update user profile
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *
 *   delete:
 *     summary: Delete user account
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.route("/profile")
    .all(verifyJwt)
    .get(getUserProfile)
    .patch(updateProfileData)
    .delete(deleteUser);

/**
 * @swagger
 * /api/users/password:
 *   post:
 *     summary: Change user password
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.route("/password").post(verifyJwt, changeCurrentPassword);

/**
 * @swagger
 * /api/users/email-verification/send:
 *   post:
 *     summary: Send email verification token
 *     tags: [Verification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The user's email address
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Verification email sent successfully
 *       400:
 *         description: Email is required
 *       401:
 *         description: Unauthorized - User not found
 *       500:
 *         description: Internal server error
 */
router.route("/email-verification/send").post(sendemailVerificationToken);

/**
 * @swagger
 * /api/users/phone-verification/send:
 *   post:
 *     summary: Send phone verification token
 *     tags: [Verification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *                 description: The user's phone number
 *                 example: "+1234567890"
 *     responses:
 *       200:
 *         description: Verification code sent to phone successfully
 *       400:
 *         description: Phone is required
 *       401:
 *         description: Unauthorized - User not found
 *       500:
 *         description: Internal server error
 */
router.route("/phone-verification/send").post(sendphoneVerificationToken);

/**
 * @swagger
 * /api/users/email-verification/{token}:
 *   post:
 *     summary: Verify email using a token
 *     tags: [Verification]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The email verification token
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Token not found
 *       500:
 *         description: Internal server error
 */
router.route("/email-verification/:token").post(verifyEmail);

/**
 * @swagger
 * /api/users/phone-verification:
 *   post:
 *     summary: Verify phone using a token
 *     tags: [Verification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: The phone verification token
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Phone verified successfully
 *       400:
 *         description: Token not found
 *       500:
 *         description: Internal server error
 */
router.route("/phone-verification").post(verifyPhone);

export default router;
