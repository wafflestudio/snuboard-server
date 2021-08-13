import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { fbConfig } from '../fbconfig';
import { encodeTag } from '../functions/custom-function';
import { User } from '../user/user.entity';

@Injectable()
export class FirebaseService {
  constructor() {
    admin.initializeApp({ credential: admin.credential.cert(fbConfig) });
  }

  async createUserSubscription(user: User, token: string) {
    const tags = await user.getSubscribedTags();

    await Promise.all(
      tags.map((tag) => {
        admin
          .messaging()
          .subscribeToTopic(token, encodeTag(tag.name, tag.department));
      }),
    );
  }

  async deleteUserSubscription(user: User, token: string) {
    const tags = await user.getSubscribedTags();

    await Promise.all(
      tags.map((tag) => {
        admin
          .messaging()
          .unsubscribeFromTopic(token, encodeTag(tag.name, tag.department));
      }),
    );
  }
}
