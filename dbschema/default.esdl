module default {
    type Todo {
        required completed: bool {default := false};
        required name: str {};
    }
}

module Generator {
    type Page {
        required slug: str {constraint exclusive};
        multi queries: str;
        multi messages: json;
    }
}