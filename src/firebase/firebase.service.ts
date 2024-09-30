import { Injectable } from '@nestjs/common';
import admin from 'firebase-admin';

import { encodeTag } from '../functions/custom-function';
import { User } from '../user/user.entity.js';

@Injectable()
export class FirebaseService {
    constructor() {
        admin.initializeApp({ credential: admin.credential.applicationDefault() });
    }

    async createUserSubscription(user: User, token: string) {
        const tags = await user.getSubscribedTags();

        return await Promise.all(
            tags.map((tag) => {
                admin.messaging().subscribeToTopic(token, encodeTag(tag.name, tag.department));
            }),
        );
    }

    async deleteUserSubscription(user: User, token: string) {
        const tags = await user.getSubscribedTags();

        return await Promise.all(
            tags.map((tag) => {
                admin.messaging().unsubscribeFromTopic(token, encodeTag(tag.name, tag.department));
            }),
        );
    }
}
