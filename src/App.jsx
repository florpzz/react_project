import { useState, useEffect } from "react"
import { getCandidateByEmail, getJobList, applyToJob } from "./api/api"
import JobList from "./components/JobList"
import "./App.css"
import { CANDIDATE_EMAIL } from "./api/config"

function App() {
  const [candidate, setCandidate] = useState(null)
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submittingJobId, setSubmittingJobId] = useState(null)
  const [submitMessage, setSubmitMessage] = useState(null)
  const [submitError, setSubmitError] = useState(null)
  const email = CANDIDATE_EMAIL

  useEffect(() => {
    const controller = new AbortController()

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [candidateData, jobsData] = await Promise.all([
          getCandidateByEmail(email, controller.signal),
          getJobList(controller.signal),
        ])

        setCandidate(candidateData)
        setJobs(jobsData)
      } catch (err) {
        if (err?.name === "AbortError") return
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    return () => controller.abort()
  }, [email])

  const handleApply = async (jobId, repoUrl) => {
    if (!candidate) {
      setSubmitError(new Error("Candidate data not loaded yet"))
      return
    }

    if (!repoUrl || !repoUrl.trim()) {
      setSubmitError(new Error("Repo URL is required"))
      return
    }

    try {
      setSubmittingJobId(jobId)
      setSubmitMessage(null)
      setSubmitError(null)

      const result = await applyToJob({
        uuid: candidate.uuid,
        jobId,
        candidateId: candidate.candidateId,
        applicationId: candidate.applicationId,
        repoUrl: repoUrl.trim(),
      })

      if (result?.ok) {
        setSubmitMessage("Application submitted successfully")
      } else {
        setSubmitError(new Error("Failed to submit application"))
      }
    } catch (err) {
      setSubmitError(err)
    } finally {
      setSubmittingJobId(null)
    }
  }

  if (loading) return <div className="container">Please wait a moment...</div>
  if (error) return <div className="container error">Error: {error.message}</div>

  return (
    <div className="container">
      <header>
        <h1>Available Positions</h1>
        {candidate && (
          <p>
            Hello, <strong>{candidate.firstName} {candidate.lastName}</strong>!
          </p>
        )}
        {submitMessage && <div className="notice">{submitMessage}</div>}
        {submitError && <div className="notice error">{submitError.message}</div>}
      </header>
      <main>
        <JobList jobs={jobs} onApply={handleApply} submittingJobId={submittingJobId} />
      </main>
    </div>
  )
}

export default App