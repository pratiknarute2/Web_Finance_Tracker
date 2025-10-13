const { test, expect } = require('@playwright/test');
const fs = require('fs/promises');

class Utility {
    async clickElement(locator, stepName) {
        const startTime = performance.now();
        process.stdout.write(`🔄 Clicking: ${stepName}...\n`);

        try {
            await locator.waitFor({ state: 'visible', timeout: 10000 }); // Increased timeout
            await locator.scrollIntoViewIfNeeded(); // Ensure element is in view

            const timeTaken = ((performance.now() - startTime) / 1000).toFixed(2);
            await locator.click();
            process.stdout.write(`✅ Clicked [${stepName}]\n`);
            process.stdout.write(`⏳ Time taken: ${timeTaken} sec\n`);
        } catch (error) {
            const errorMessage = `❌ Failed to click [${stepName}] --> ${error.message}`;
            process.stdout.write(`${errorMessage}\n`);
            throw new Error(errorMessage);
        }
        console.log('-'.repeat(100));
    }

    async fillInputField(locator, value, stepName) {
        const startTime = performance.now();
        process.stdout.write(`🔄 Filling: ${stepName}...\n`);

        try {
            await locator.waitFor({ state: "visible", timeout: 10000 }); // Increased timeout
            await locator.scrollIntoViewIfNeeded(); // Ensure element is in view

            await locator.fill(value);
            const timeTaken = ((performance.now() - startTime) / 1000).toFixed(2);
            process.stdout.write(`✅ Filled [${stepName}] with value: ${value}\n`);
            process.stdout.write(`⏳ Time taken: ${timeTaken} sec\n`);
        } catch (error) {
            const errorMessage = `❌ Failed to fill [${stepName}] --> ${error.message}`;
            process.stdout.write(`${errorMessage}\n`);
            throw new Error(errorMessage);
        }
        console.log('-'.repeat(100));
    }

    async isDisplay(locator, miliSec, stepName) {
        let isVisible = false; // <-- Fix: use let
        const startTime = performance.now();

        try {
            process.stdout.write(`🔄 Verifying: ${stepName}...\n`);
            await locator.waitFor({ state: 'visible', timeout: miliSec });
            isVisible = await locator.isVisible();
            process.stdout.write(`✅ Found [${stepName}]\n`);
        } catch {
            const errorMessage = `❌ Failed to verify visibility of [${stepName}]`;
            process.stdout.write(`${errorMessage}\n`);
        }

        const timeTaken = ((performance.now() - startTime) / 1000).toFixed(2);
        process.stdout.write(`⏳ Time taken: ${timeTaken} sec\n`);
        console.log('-'.repeat(100));

        return isVisible;
    }

    async expectToBe(actual, expected, errorMessage) {
        console.log(`🔍 Verifying: ${errorMessage}`);
        console.log(`Actual: ${actual} | Expected: ${expected}`)
        try {
            await expect(actual).toBe(expected, { timeout: 10000 })
        } catch (error) {
            const formattedErrorMessage = `❌ ${errorMessage} Expected: ${expected}, but got: ${actual} ==> ${error.message}`;
            process.stdout.write(`${formattedErrorMessage}\n`);
            throw new Error(formattedErrorMessage);
        } finally {
            console.log('-'.repeat(100));
        }

    }
    async navigateOnURL(page, url) {
        const startTime = performance.now(); // Start timer
        process.stdout.write(`🌐 Navigating to URL: [${url}]...\n`);

        try {
            // Validate URL before attempting navigation
            if (!url || typeof url !== 'string' || !url.startsWith('http')) {
                throw new Error(`Invalid URL provided: ${url}`);
            }

            // Navigate to the page and wait until DOM is ready
            await page.goto(url, { waitUntil: "domcontentloaded" });
            await expect(page).toHaveURL(url, { timeout: 10000 });

            // Calculate elapsed time
            const timeTaken = ((performance.now() - startTime) / 1000).toFixed(2);
            process.stdout.write(`✅ Successfully navigated to: [${url}]\n`);
            process.stdout.write(`⏳ Time taken: ${timeTaken} sec\n`);
        } catch (error) {
            const errorMessage = `❌ Failed to navigate to [${url}]. Error: ${error.message}`;
            process.stdout.write(`${errorMessage}\n`);
            throw new Error(errorMessage);
        } finally {
            console.log('-'.repeat(100));
        }
    }


    async postRequest(request, URI, payloadKey, testName) {
        process.stdout.write(`🔄 Verifying: ${testName}...\n`);
        try {
            const data = JSON.parse(await fs.readFile('API/Payloads.json', 'utf-8'));
            const payloadBody = data[payloadKey];

            if (!payloadBody) {
                throw new Error(`❌ Payload key '${payloadKey}' not found in Payloads.json`);
            }

            console.log("✅ Payload:", JSON.stringify(payloadBody, null, 2));
            const startTime = Date.now();

            const response = await request.post(URI, {
                data: payloadBody,
                headers: {
                    'Content-Type': 'application/json',
                    ...(global.token && { authorization: 'Bearer ' + global.token }) // optional auth header
                }
            });

            const endTime = Date.now();
            const responseTime = endTime - startTime;
            console.log(`⏱️ Response Time: ${responseTime} ms`);
            console.log("🔁 Status Code:", response.status());

            if (!response.ok()) {
                throw new Error(`❌ Request failed with status ${response.status()}`);
            }

            const rawText = await response.text();
            const responseSizeInBytes = Buffer.byteLength(rawText, 'utf8');
            const responseSizeInKB = (responseSizeInBytes / 1024).toFixed(2);
            console.log(`📦 Response Size: ${responseSizeInKB} KB`);

            const responseData = JSON.parse(rawText);
            console.log("🧾 JSON Response:", responseData);
            console.log('-'.repeat(100));
            return responseData;

        } catch (error) {
            console.error("❌ Error in postRequest():", error.message);
            console.log('-'.repeat(100));
            throw error; // ✅ re-throw to fail the test
        }
    }


    async getRequest(request, URI, testName) {
        process.stdout.write(`🔄 Verifying: ${testName}...\n`);
        try {
            console.log(`🌐 Sending GET request to: ${URI}`);

            // ✅ Create a new request context if old one is closed or undefined
            let apiRequest = request;
            if (!request || request._closed) {
                const playwright = require('@playwright/test').playwright;
                apiRequest = await playwright.request.newContext({
                    baseURL: URI,
                    extraHTTPHeaders: {
                        'Content-Type': 'application/json',
                        ...(global.token && { authorization: 'Bearer ' + global.token }) // optional auth header
                    }
                });
                console.log('⚠️ Created new APIRequestContext because old one was closed');
            }

            const startTime = Date.now();
            const response = await apiRequest.get(URI, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const endTime = Date.now();

            const responseTime = endTime - startTime;
            const responseBody = await response.body();
            const responseSizeKB = (Buffer.byteLength(responseBody) / 1024).toFixed(2);

            console.log("🔁 Status Code:", response.status());
            console.log(`⏱️ Response Time: ${responseTime} ms`);
            console.log(`📦 Response Size: ${responseSizeKB} KB`);

            if (!response.ok()) {
                throw new Error(`❌ GET request failed with status ${response.status()}`);
            }

            const responseData = JSON.parse(responseBody);
            console.log("🧾 GET Response:", responseData);
            console.log('-'.repeat(100));
            return responseData;

        } catch (error) {
            console.error("❌ Error in getRequest():", error.message);
            console.log('-'.repeat(100));
            throw error; // RE-THROW to fail the test
        }
    }




    // ✅ Updated PUT request function (Utility.js)
    async putRequest(request, URI, payloadKey, testName) {
        process.stdout.write(`🔄 Verifying: ${testName}...\n`);
        try {
            console.log(`🛠️ Sending PUT request to: ${URI}`);

            // ✅ Read payload from JSON file
            const data = JSON.parse(await fs.readFile('API/Payloads.json', 'utf-8'));
            const payloadBody = data[payloadKey];

            if (!payloadBody) {
                throw new Error(`❌ Payload key '${payloadKey}' not found in Payloads.json`);
            }

            console.log("✅ Payload:", JSON.stringify(payloadBody, null, 2));

            // ✅ Ensure valid request context
            let apiRequest = request;
            if (!request || request._closed) {
                const playwright = require('@playwright/test').playwright;
                apiRequest = await playwright.request.newContext({
                    baseURL: URI,
                    extraHTTPHeaders: {
                        'Content-Type': 'application/json',
                        ...(global.token && { authorization: 'Bearer ' + global.token })
                    }
                });
                console.log('⚠️ Created new APIRequestContext because old one was closed');
            }

            // ✅ Send PUT request
            const startTime = Date.now();
            const response = await apiRequest.put(URI, {
                data: payloadBody,
                headers: {
                    'Content-Type': 'application/json',
                    ...(global.token && { authorization: 'Bearer ' + global.token })
                }
            });
            const endTime = Date.now();

            const responseTime = endTime - startTime;
            const rawText = await response.text();
            const responseSizeKB = (Buffer.byteLength(rawText, 'utf8') / 1024).toFixed(2);

            console.log("🔁 Status Code:", response.status());
            console.log(`⏱️ Response Time: ${responseTime} ms`);
            console.log(`📦 Response Size: ${responseSizeKB} KB`);

            if (!response.ok()) {
                throw new Error(`❌ PUT request failed with status ${response.status()}`);
            }

            // ✅ Parse response
            let responseData = {};
            if (rawText) {
                responseData = JSON.parse(rawText);
                console.log("🧾 PUT Response:", responseData);
            } else {
                console.log("🧾 PUT Response: <empty>");
            }



            // ✅ Flexible validation
            if (
                (responseData.success !== undefined && !responseData.success) ||
                (!responseData.id && !responseData.name && !responseData.type)
            ) {
                throw new Error(`❌ PUT request did not update the content properly! Response: ${JSON.stringify(responseData)}`);
            }

            console.log(`✅ PUT request updated successfully! Updated name: ${responseData.name || 'N/A'}`);
            console.log('-'.repeat(100));
            return responseData;

        } catch (error) {
            console.error("❌ Error in putRequest():", error.message);
            console.log('-'.repeat(100));
            throw error; // RE-THROW to fail the test
        }
    }



    async deleteRequest(request, URI, testName) {
        process.stdout.write(`🔄 Verifying: ${testName}...\n`);
        try {
            console.log(`🗑️ Sending DELETE request to: ${URI}`);

            let apiRequest = request;
            if (!request || request._closed) {
                const playwright = require('@playwright/test').playwright;
                apiRequest = await playwright.request.newContext({
                    baseURL: URI,
                    extraHTTPHeaders: {
                        'Content-Type': 'application/json',
                        ...(global.token && { authorization: 'Bearer ' + global.token })
                    }
                });
                console.log('⚠️ Created new APIRequestContext because old one was closed');
            }

            const startTime = Date.now();
            const response = await apiRequest.delete(URI, {
                headers: {
                    'Content-Type': 'application/json',
                    ...(global.token && { authorization: 'Bearer ' + global.token })
                }
            });
            const endTime = Date.now();

            const responseTime = endTime - startTime;
            const rawText = await response.text();
            const responseSizeKB = (Buffer.byteLength(rawText, 'utf8') / 1024).toFixed(2);

            console.log("🔁 Status Code:", response.status());
            console.log(`⏱️ Response Time: ${responseTime} ms`);
            console.log(`📦 Response Size: ${responseSizeKB} KB`);

            let responseData = {};
            if (rawText) {
                responseData = JSON.parse(rawText);
                console.log("🧾 DELETE Response:", responseData);
            } else {
                console.log("🧾 DELETE Response: <empty>");
            }
            console.log('-'.repeat(100));

            // ✅ Check DELETE success using status code 204 or success flag in response
            if (!(response.ok() || response.status() === 204)) {
                throw new Error(`❌ DELETE request did not delete the content! Response: ${JSON.stringify(responseData)}`);
            }

            return responseData.requiredKey || null;

        } catch (error) {
            console.error("❌ Error in deleteRequest():", error.message);
            console.log('-'.repeat(100));
            throw error; // RE-THROW to fail the test
        }
    }

    async selectDropdown(locator, optionValue, stepName = 'Dropdown') {
        const startTime = performance.now();
        process.stdout.write(`🔄 Selecting [${optionValue}] from ${stepName}...\n`);

        try {
            // ✅ Check that page and locator are still valid
            if (!this.page || this.page.isClosed()) {
                throw new Error('Page or browser context is closed.');
            }

            await locator.waitFor({ state: 'visible', timeout: 10000 });
            await locator.scrollIntoViewIfNeeded();

            // ✅ Double-check dropdown exists before selecting
            const isVisible = await locator.isVisible();
            if (!isVisible) {
                throw new Error(`${stepName} not visible for selecting.`);
            }

            await locator.selectOption({ label: optionValue });

            const timeTaken = ((performance.now() - startTime) / 1000).toFixed(2);
            process.stdout.write(`✅ Selected [${optionValue}] from ${stepName}\n`);
            process.stdout.write(`⏳ Time taken: ${timeTaken} sec\n`);
        } catch (error) {
            const errorMessage = `❌ Failed to select [${optionValue}] from ${stepName} --> ${error.message}`;
            process.stdout.write(`${errorMessage}\n`);
            throw new Error(errorMessage);
        }

        console.log('-'.repeat(100));
    }

    formatDateToYYYYMMDD(uiDate) {
        const [month, day, year] = uiDate.split('/'); // Split by '/'
        const mm = month.padStart(2, '0'); // pad month to 2 digits
        const dd = day.padStart(2, '0');   // pad day to 2 digits
        return `${year}-${mm}-${dd}`;
    }

    async removeSpecialCharFromNumber(locator) {
        const text = (await locator.textContent() || "")
            .replace(/[^\d.-]/g, '').trim();
        const amount = parseFloat(text) || 0;
        return amount
    }

    async staticWait(sec) {
        console.log(`⏳ Waiting for ${sec}s...`);
        await this.page.waitForTimeout((sec * 1000))
        console.log('-'.repeat(100));
    }






}

module.exports = Utility;
