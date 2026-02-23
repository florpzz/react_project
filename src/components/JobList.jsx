import JobItem from './JobItem';

const JobList = ({ jobs, onApply, submittingJobId }) => {
    if (jobs.length === 0) return <p>No positions available at this moment.</p>;

    return (
        <div className="job-list">
            {jobs.map((job) => (
                <JobItem
                    key={job.id}
                    job={job}
                    onApply={onApply}
                    isSubmitting={submittingJobId === job.id}
                />
            ))}
        </div>
    );
};

export default JobList;