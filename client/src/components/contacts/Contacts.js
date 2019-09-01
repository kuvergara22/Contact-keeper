import React, { Fragment, useContext, useEffect } from 'react';
import {CSSTransition, TransitionGroup} from 'react-transition-group';
import ContactItem from './ContactItem';
import Spinner from '../layout/Spinner';
import ContactContext from '../../context/contact/contactContext';

const Contacts = () => {
    
//gives access to any state or method 
const contactContext = useContext(ContactContext);

const { contacts, filtered, getContacts, loading } = contactContext;

useEffect( () => {
 getContacts();
 // eslint-disable-next-line
}, []);

 if (contacts !== null && contacts.length === 0 && !loading ) {
   return <h4>Add Contact</h4>;
 }

 return (
  <Fragment>
    {contacts !== null && !loading ? ( <TransitionGroup>
    {filtered !== null ?
    filtered.map( contact => (
      <CSSTransition key={contact} timeout={500} className='item'>
      <ContactItem key={contact._id}  contact={contact}/>
     </CSSTransition>
    )) : 
      contacts.map(contact => (
        <CSSTransition key={contact} timeout={500} className='item'>
      <ContactItem key={contact._id}  contact={contact}/>
      </CSSTransition>
    )
    )}
   </TransitionGroup> ) : <Spinner/>}
    
  </Fragment>
  );
};
export default Contacts;