fetch("https://wandbox.org/api/compile.json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        compiler: undefined,
        code: "class Solution {};"
    })
}).then(r => r.json()).then(console.log).catch(console.error);
