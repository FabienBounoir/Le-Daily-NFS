import { json } from '@sveltejs/kit';
import { userService } from '$lib/server/services/user.service.js';

/** @type {import('./$types').RequestHandler} */
export async function PUT({ request, cookies }) {
    try {
        const { userId, decoration } = await request.json();

        if (!userId) {
            return json({ error: 'User ID is required' }, { status: 400 });
        }

        // Récupérer le token JWT depuis les cookies
        const token = cookies.get('authToken');
        if (!token) {
            return json({ error: 'Authentication required' }, { status: 401 });
        }

        // Vérifier l'utilisateur connecté
        const currentUser = await userService.getFromJWT(token);
        if (!currentUser || currentUser._id === "-1") {
            return json({ error: 'Invalid authentication' }, { status: 401 });
        }

        // Mettre à jour la décoration de l'utilisateur dans la liste des users
        const updatedUser = await userService.updateUserDecoration(currentUser.teams[0], userId, decoration);

        if (!updatedUser) {
            return json({ error: 'User not found' }, { status: 404 });
        }

        return json({ success: true, decoration });
    } catch (error) {
        console.error('Error updating user decoration:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
}
