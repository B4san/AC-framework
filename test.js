const regex = /^https:\/\/api\.github\.com\/repos\/[\w.-]+\/[\w.-]+\/tarball\/[\w./_-]+$/;
console.log(regex.test("https://api.github.com/repos/b4san/AC-framework/tarball/main"));
