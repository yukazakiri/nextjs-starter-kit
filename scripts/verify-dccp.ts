import { fetchDCCPUser } from "../lib/dccp";

const email = process.argv[2] || "test@example.com";

console.log(`Testing DCCP API for email: ${email}`);

async function main() {
    try {
        const result = await fetchDCCPUser(email);
        console.log("Result:", JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("Error running verification:", error);
    }
}

main();
