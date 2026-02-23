import { useState } from 'react';
import './JobItem.css';

const JobItem = ({ job, onApply, isSubmitting }) => {
    const [repoUrl, setRepoUrl] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!repoUrl) return alert('Please enter your repository URL');
        onApply(job.id, repoUrl);
    };

    return (
        <div className="job-item">
            <h3>{job.title}</h3>
            <form onSubmit={handleSubmit}>
                <div className="job-item__field">
                    <label htmlFor={`repoUrl-${job.id}`}>
                        GitHub repository URL:
                    </label>
                    <input
                        id={`repoUrl-${job.id}`}
                        type="url"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        placeholder="https://github.com/user/repo"
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Sending...' : 'Send'}
                </button>
            </form>
        </div>
    );
};

export default JobItem;
