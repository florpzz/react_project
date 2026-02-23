import { BASE_URL, USE_MOCK } from "./config"

const DEFAULT_TIMEOUT_MS = 10000

export class ApiError extends Error {
    constructor(message, status, body) {
        super(message)
        this.name = "ApiError"
        this.status = status
        this.body = body
    }
}

async function requestJson(path, options = {}) {
    const { body: reqBody, method = "GET", headers: customHeaders, timeout = DEFAULT_TIMEOUT_MS, ...rest } = options

    const headers = { ...customHeaders }
    if (reqBody) {
        headers["Content-Type"] = "application/json"
    }

    let res
    try {
        res = await fetch(`${BASE_URL}${path}`, {
            method,
            headers,
            body: reqBody,
            signal: AbortSignal.timeout(timeout),
            ...rest,
        })
    } catch (err) {
        if (err.name === "TimeoutError") {
            const e = new ApiError(`Request timed out after ${timeout}ms`, 0, null)
            e.cause = err
            throw e
        }
        const e = new ApiError("Network error", 0, null)
        e.cause = err
        throw e
    }

    const contentType = res.headers.get("content-type") || ""
    const isJson = contentType.includes("application/json")

    let body
    try {
        body = isJson ? await res.json() : await res.text()
    } catch (err) {
        const e = new ApiError("Invalid response body", res.status, null)
        e.cause = err
        throw e
    }

    if (!res.ok) {
        const msg = (isJson && body && (body.message || body.error)) || `HTTP error ${res.status}`
        throw new ApiError(msg, res.status, body)
    }

    return body
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getCandidateByEmail(email) {
    if (USE_MOCK) {
        await sleep(800)

        if (email.includes("error")) {
            throw new Error("Mock: candidate not found")
        }

        return {
            uuid: "mock-uuid-123",
            candidateId: "mock-id-123",
            applicationId: "mock-app-123",
            firstName: "Jane",
            lastName: "Doe",
            email,
        }
    }
    const q = encodeURIComponent(email)
    return requestJson(`/api/candidate/get-by-email?email=${q}`)
}

export async function getJobList() {
    if (USE_MOCK) {
        await sleep(800)

        return [
            { id: "4416372005", title: "Fullstack developer" },
            { id: "9100000001", title: "Head Chef" },
        ]
    }

    return requestJson(`/api/jobs/get-list`)
}

export async function applyToJob(applicationData) {

    if (USE_MOCK) {
        await sleep(800)

        if (applicationData.repoUrl.includes("fail")) {
            throw new Error("Mock: invalid repository URL")
        }

        return { ok: true }
    }
    return requestJson(`/api/candidate/apply-to-job`, {
        method: "POST",
        body: JSON.stringify(applicationData),
    })
}
