fetch("https://wandbox.org/api/compile.json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        compiler: "gcc-head",
        code: "class Solution {\n} int main() { return 0; }"
    })
}).then(r => r.json()).then(console.log);
