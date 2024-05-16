module default {
    type Post {
        required title: str;
        required content: str {
            default := ""
        }
        required from_user: User;
        multi link comment  := .<post[is Comment];
    }

    type Comment {
        required post: Post;
    }

    type User {
        required name: str;
        multi link posts  := .<from_user[is Post];
    }
}
