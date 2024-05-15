module default {
    type Post {
        required title: str;
        required content: str {
            default := ""
        }
    }
}
