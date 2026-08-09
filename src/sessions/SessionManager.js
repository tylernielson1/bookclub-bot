class SessionManager {
    constructor() {
        this.sessions = new Map();
    }

    set(messageId, session) {
        this.sessions.set(messageId, session);
    }

    get(messageId) {
        const session =  this.sessions.get(messageId);

        if (!session) { 
            return null;
        }

        if (session.expired) {
            this.sessions.delete(messageId);
            return null;
        }

        return session;
    }

    delete(messageId) {
        this.sessions.delete(messageId);
    }

    clear() {
        this.sessions.clear();
    }

    cleanup() {
        for (const [messageId, session] of this.sessions) {
            if (session.expired) {
                this.sessions.delete(messageId);
            }
        }
    }
}

module.exports = new SessionManager();