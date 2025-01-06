import { useEffect, useState } from 'react';
import { Table, Button, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import API from '../../API';
import "../App.css";
import { BsPiggyBankFill } from 'react-icons/bs'; 

export default function ProposalList(props) {
    const [proposals, setProposals] = useState([]);
    const [feedback, setFeedback] = useState('');
    const navigate = useNavigate();

    const setFeedbackFromError = (err) => {
        let message = '';
        if (err.message) message = err.message;
        else message = "Unknown Error";
        setFeedback(message); 
    };

    useEffect(() => {
        API.getProposalsByUserId()
        .then(proposals => {
            setProposals(proposals);
        })
        .catch(e => {
            setFeedbackFromError(e);
        });
    }, []); 

    const handleAddProposal = () => {
        navigate('/proposalform');
    };

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            props.logout();
            navigate('/');
        } catch (err) {
            console.log(err);
        }
    }
    
    const handleSubmitA = async (e) => {
        e.preventDefault();
        try{
            await API.changePhase();
            navigate('/preferencesform')
        }catch (err){
            console.log(err);
        }
    }

    const handleEditProposal = (id) => {
        navigate('/proposalform/'+id);
    }

    const handleDeleteProposal = async(id) => {
        try{
            await API.deleteProposal(id);
            API.getProposalsByUserId()
            .then(proposals => {
                setProposals(proposals);
            })
            .catch(e => {
                setFeedbackFromError(e);
            });
        }catch(err){
            setFeedbackFromError(err);
        }
    }

    return (
        <Container>
            <Row className="headerRow">
            <BsPiggyBankFill size={40} className="me-2"/>
                <h1 className='md-3'>Budget Sociale</h1>
                <Button variant='secondary' onClick={handleLogout}>Logout</Button>
                {props.user.role === "Admin" && 
                    <Button className="ms-3" variant='secondary' onClick={handleSubmitA}>Change phase</Button>
                }
            </Row>
            <Row className="formRow">
                <Col>
                    {feedback && <p className="feedback">{feedback}</p>}
                    <h2 className='md-2'>Your proposals</h2>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Budget</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {proposals.map((proposal) => (
                                <tr key={proposal.id}>
                                    <td>{proposal.description}</td>
                                    <td>{proposal.budget}€</td>
                                    <td>
                                        <Button variant='info' onClick={() => handleEditProposal(proposal.id)}>Edit</Button>
                                        <Button variant='danger' onClick={() => handleDeleteProposal(proposal.id)}>Delete</Button>
                                    </td>
                                </tr>
                            ))}
                            <tr>
                                <td colSpan="3" className="text-center">
                                    <Button variant="primary" onClick={handleAddProposal}>+</Button>
                                </td>
                            </tr>
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </Container>
    );
}
