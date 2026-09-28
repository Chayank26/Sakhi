import { Link } from 'react-router-dom';
import { useAccount } from '../../account/accountContext';
import { HomeHeader } from '../home/HomeHeader';
export function SavedSchemesPage() {
    const { data, toggleSaved } = useAccount();
    return <><HomeHeader pageTitle="Saved schemes" /><main className="activity-page"><Link to="/schemes">Browse schemes</Link><h1>Saved schemes</h1>
        {!data.saved.schemes.length && <p>No saved schemes yet.</p>}
        {data.saved.schemes.map(scheme => <article key={scheme._id}><Link to={`/schemes/${scheme._id}`}>{scheme.name}</Link><p>{scheme.shortDescription}</p><button onClick={() => toggleSaved('schemes', scheme._id)}>Remove bookmark</button></article>)}
    </main></>;
}
