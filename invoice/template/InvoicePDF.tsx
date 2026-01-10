"use client";

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { InvoiceWithDetails } from '@/types';

// Register font (example with a simple font)
// You might need to load Inter from a URL or local file if you want to use it
// Font.register({ family: 'Inter', src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMwM8DdmzfClient.ttf' });

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica', // Using a default font, consider registering Inter if needed
    fontSize: 11,
    paddingTop: 30,
    paddingLeft: 40,
    paddingRight: 40,
    lineHeight: 1.5,
    flexDirection: 'column',
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#005f73',
  },
  section: {
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  text: {
    marginBottom: 5,
  },
  bold: {
    fontWeight: 'bold',
  },
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 10,
    marginTop: 10,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: '#f0f0f0',
    padding: 5,
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: 'grey',
  },
});

interface InvoicePDFProps {
  invoice: InvoiceWithDetails;
  // Potentially include more details like company info, line items from subscription, etc.
}

const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>INVOICE</Text>

      <View style={styles.section}>
        <View style={styles.row}>
          <Text>Invoice No: <Text style={styles.bold}>{invoice.invoice_number}</Text></Text>
          <Text>Date: {new Date(invoice.created_at).toLocaleDateString()}</Text>
        </View>
        <View style={styles.row}>
          <Text>Due Date: <Text style={styles.bold}>{new Date(invoice.due_date).toLocaleDateString()}</Text></Text>
          <Text>Status: <Text style={styles.bold}>{invoice.status}</Text></Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.bold}>Bill To:</Text>
        <Text>{invoice.client.name}</Text>
        <Text>{invoice.client.email}</Text>
        {/* Add client address if available in type */}
      </View>

      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableColHeader}>Description</Text>
          <Text style={styles.tableColHeader}>Qty</Text>
          <Text style={styles.tableColHeader}>Unit Price</Text>
          <Text style={styles.tableColHeader}>Amount</Text>
        </View>
        {/* For now, assuming a single line item from subscription or just total amount */}
        <View style={styles.tableRow}>
          <Text style={styles.tableCol}>Service / Product</Text>
          <Text style={styles.tableCol}>1</Text>
          <Text style={styles.tableCol}>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(invoice.total_amount)}</Text>
          <Text style={styles.tableCol}>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(invoice.total_amount)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={{ width: '75%', textAlign: 'right' }}>Total:</Text>
          <Text style={{ width: '25%' }}>{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(invoice.total_amount)}</Text>
        </View>
      </View>

      <Text style={styles.footer}>Nusabit Billing - Thank you for your business!</Text>
    </Page>
  </Document>
);

export default InvoicePDF;
