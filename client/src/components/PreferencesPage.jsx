import { useEffect, useState, useContext } from 'react';
import { Form, Button, Container, Row, Col, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import API from '../../API';
import FeedbackContext from "../contexts/FeedbackContext.js";
import { BsPiggyBankFill } from 'react-icons/bs'; 

export default function PreferencesPage(props) {
    const [proposals, setProposals] = useState([]);
    const [preferences, setPreferences] = useState({});
    const [feedback, setFeedback] = useState('');
    const navigate = useNavigate();
    const {setShouldRefresh} = useContext(FeedbackContext);

    const setFeedbackFromError = (err) => {
        let message = '';
        if (err.message) message = err.message;
        else message = "Unknown Error";
        setFeedback(message);
    };

    useEffect(() => {
        const fetchProposalsAndPreferences = async () => {
            try {
                const fetchedProposals = await API.getAllProposals();
                setProposals(fetchedProposals);
                
                if (props.user && props.user.id) {
                    const fetchedPreferences = await API.getPreferencesByUserId(props.user.id);
                    const initialPreferences = {};
                    fetchedPreferences.forEach(p => {
                        initialPreferences[p.proposalId] = p.score;
                    });
                    setPreferences(initialPreferences);
                }
            } catch (e) {
                setFeedbackFromError(e);
            }
        };        
        fetchProposalsAndPreferences();
    }, [props.user]);

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            await props.logout();
            navigate('/');
        } catch (err) {
            console.log(err);
        }
    };

    const handlePreferenceChange = async (proposalId, value) => {
        setPreferences(prevPreferences => ({
            ...prevPreferences,
            [proposalId]: value
        }));
        try {
            await API.addPreference(proposalId, value);
        } catch (err) {
            console.log(err);
        }
    };

    const handlePreferenceDelete = async (proposalId) => {
        try {
            await API.deletePreference(proposalId);
            setPreferences(prevPreferences => {
                const updatedPreferences = { ...prevPreferences };
                delete updatedPreferences[proposalId];
                return updatedPreferences;
            });
            alert("Preference deleted successfully");
        } catch (err) {
            console.log(err);
        }
    };

    const handleSubmitA = async (e) => {
        e.preventDefault();
        try {
            await API.changePhase();
            setShouldRefresh(true);
            navigate('/anonymouspage');
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <Container>
            <Row className='headerRow'>
            <BsPiggyBankFill size={40} className="me-2"/>
                <h1>Budget Sociale</h1>
                <Button variant='secondary' onClick={handleLogout}>Logout</Button>
                {props.user && props.user.role === "Admin" &&
                    <Button variant='secondary' onClick={handleSubmitA}>Change phase</Button>
                }
            </Row>
            <Row className='formRow'>
                <Col>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Proposal</th>
                                <th>Budget</th>
                                <th>Rating</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {proposals.map(proposal => (
                                <tr key={proposal.id}>
                                    <td>{proposal.description}</td>
                                    <td>{proposal.budget}€</td>
                                    <td>
                                        {proposal.userId !== props.user.username && (
                                           <Form.Control 
                                           as="select" 
                                           onChange={(e) => handlePreferenceChange(proposal.id, e.target.value)} 
                                           value={preferences[proposal.id] || 0}
                                           disabled={preferences[proposal.id] !== undefined} 
                                       >
                                           <option value="0" disabled>0</option>
                                           <option value="1">1</option>
                                           <option value="2">2</option>
                                           <option value="3">3</option>
                                       </Form.Control>
                                       
                                        )}
                                    </td>
                                    <td>
                                        {proposal.userId !== props.user.username && preferences[proposal.id] && (
                                            <Button variant='danger' onClick={() => handlePreferenceDelete(proposal.id)}>Delete</Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </Container>
    );
}
