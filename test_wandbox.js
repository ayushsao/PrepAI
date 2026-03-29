fetch("https://wandbox.org/api/compile.json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        compiler: "gcc-head",
        code: "#include <iostream>\n#include <vector>\n#include <string>\n#include <algorithm>\n#include <map>\n#include <set>\n#include <unordered_map>\n#include <unordered_set>\n#include <queue>\n#include <stack>\nusing namespace std;\n\nstruct PolyNode {\n    int coefficient, power;\n    PolyNode *next;\n    PolyNode(): coefficient(0), power(0), next(nullptr) {}\n    PolyNode(int x, int y): coefficient(x), power(y), next(nullptr) {}\n    PolyNode(int x, int y, PolyNode* next): coefficient(x), power(y), next(next) {}\n};\nstruct TreeNode {\n    int val;\n    TreeNode *left;\n    TreeNode *right;\n    TreeNode() : val(0), left(nullptr), right(nullptr) {}\n    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}\n};\nstruct ListNode {\n    int val;\n    ListNode *next;\n    ListNode() : val(0), next(nullptr) {}\n    ListNode(int x) : val(x), next(nullptr) {}\n    ListNode(int x, ListNode *next) : val(x), next(next) {}\n};\n\nclass Solution {};\n\nint main() {\n    // Boilerplate main function\n    // In a full execution environment, stdin parsing logic goes here.\n    return 0;\n}"
    })
}).then(r => r.json()).then(console.log).catch(console.error);
