export interface CityItem {
  name: string;
  state: string;
  popular?: boolean;
}

export interface AirportItem {
  code: string;
  city: string;
  name: string;
}

export interface StationItem {
  code: string;
  city: string;
  name: string;
}

export const INDIAN_CITIES: CityItem[] = [
  { name: 'New Delhi', state: 'Delhi', popular: true },
  { name: 'Mumbai', state: 'Maharashtra', popular: true },
  { name: 'Bengaluru', state: 'Karnataka', popular: true },
  { name: 'Kolkata', state: 'West Bengal', popular: true },
  { name: 'Chennai', state: 'Tamil Nadu', popular: true },
  { name: 'Hyderabad', state: 'Telangana', popular: true },
  { name: 'Patna', state: 'Bihar', popular: true },
  { name: 'Goa', state: 'Goa', popular: true },
  { name: 'Jaipur', state: 'Rajasthan', popular: true },
  { name: 'Ahmedabad', state: 'Gujarat', popular: true },
  { name: 'Pune', state: 'Maharashtra', popular: true },
  { name: 'Varanasi', state: 'Uttar Pradesh', popular: true },
  { name: 'Kochi', state: 'Kerala', popular: true },
  { name: 'Shimla', state: 'Himachal Pradesh', popular: true },
  { name: 'Agra', state: 'Uttar Pradesh', popular: true },
  { name: 'Amritsar', state: 'Punjab', popular: true },
  { name: 'Srinagar', state: 'Jammu & Kashmir', popular: true },
  { name: 'Guwahati', state: 'Assam' },
  { name: 'Bhubaneswar', state: 'Odisha' },
  { name: 'Lucknow', state: 'Uttar Pradesh' },
  { name: 'Indore', state: 'Madhya Pradesh' },
  { name: 'Udaipur', state: 'Rajasthan' },
  { name: 'Dehradun', state: 'Uttarakhand' },
  { name: 'Mysuru', state: 'Karnataka' },
  { name: 'Madurai', state: 'Tamil Nadu' },
  { name: 'Visakhapatnam', state: 'Andhra Pradesh' },
  { name: 'Surat', state: 'Gujarat' },
  { name: 'Nagpur', state: 'Maharashtra' },
  { name: 'Ranchi', state: 'Jharkhand' },
  { name: 'Chandigarh', state: 'Punjab' }
];

export const INDIAN_AIRPORTS: AirportItem[] = [
  { code: 'DEL', city: 'New Delhi', name: 'Indira Gandhi International Airport' },
  { code: 'BOM', city: 'Mumbai', name: 'Chhatrapati Shivaji Maharaj Intl Airport' },
  { code: 'BLR', city: 'Bengaluru', name: 'Kempegowda International Airport' },
  { code: 'MAA', city: 'Chennai', name: 'Chennai International Airport' },
  { code: 'CCU', city: 'Kolkata', name: 'Netaji Subhash Chandra Bose Intl Airport' },
  { code: 'HYD', city: 'Hyderabad', name: 'Rajiv Gandhi International Airport' },
  { code: 'PAT', city: 'Patna', name: 'Jay Prakash Narayan Airport' },
  { code: 'GOI', city: 'Goa', name: 'Dabolim Airport' },
  { code: 'GOX', city: 'Goa', name: 'Manohar International Airport, Mopa' },
  { code: 'JAI', city: 'Jaipur', name: 'Jaipur International Airport' },
  { code: 'PNQ', city: 'Pune', name: 'Pune Airport' },
  { code: 'AMD', city: 'Ahmedabad', name: 'Sardar Vallabhbhai Patel Intl Airport' },
  { code: 'COK', city: 'Kochi', name: 'Cochin International Airport' },
  { code: 'LKO', city: 'Lucknow', name: 'Chaudhary Charan Singh Intl Airport' },
  { code: 'VNS', city: 'Varanasi', name: 'Lal Bahadur Shastri Intl Airport' },
  { code: 'ATQ', city: 'Amritsar', name: 'Sri Guru Ram Dass Jee Intl Airport' },
  { code: 'SXR', city: 'Srinagar', name: 'Sheikh ul-Alam International Airport' },
  { code: 'BBI', city: 'Bhubaneswar', name: 'Biju Patnaik International Airport' },
  { code: 'GAU', city: 'Guwahati', name: 'Lokpriya Gopinath Bordoloi Intl Airport' },
  { code: 'TRV', city: 'Thiruvananthapuram', name: 'Trivandrum International Airport' },
  { code: 'IXC', city: 'Chandigarh', name: 'Shaheed Bhagat Singh Intl Airport' },
  { code: 'IDR', city: 'Indore', name: 'Devi Ahilya Bai Holkar Airport' },
  { code: 'UDR', city: 'Udaipur', name: 'Maharana Pratap Airport' }
];

export const INDIAN_TRAIN_STATIONS: StationItem[] = [
  { code: 'NDLS', city: 'New Delhi', name: 'New Delhi Railway Station' },
  { code: 'CSMT', city: 'Mumbai', name: 'Chhatrapati Shivaji Maharaj Terminus' },
  { code: 'HWH', city: 'Kolkata', name: 'Howrah Junction' },
  { code: 'SBC', city: 'Bengaluru', name: 'KSR Bengaluru City Junction' },
  { code: 'MAS', city: 'Chennai', name: 'Chennai Central' },
  { code: 'PNBE', city: 'Patna', name: 'Patna Junction' },
  { code: 'ADI', city: 'Ahmedabad', name: 'Ahmedabad Junction' },
  { code: 'PUNE', city: 'Pune', name: 'Pune Junction' },
  { code: 'BSB', city: 'Varanasi', name: 'Varanasi Junction' },
  { code: 'JP', city: 'Jaipur', name: 'Jaipur Junction' },
  { code: 'CNB', city: 'Kanpur', name: 'Kanpur Central' },
  { code: 'LKO', city: 'Lucknow', name: 'Lucknow Charbagh' },
  { code: 'SC', city: 'Hyderabad', name: 'Secunderabad Junction' },
  { code: 'GKP', city: 'Gorakhpur', name: 'Gorakhpur Junction' },
  { code: 'ERS', city: 'Kochi', name: 'Ernakulam Junction (South)' },
  { code: 'MAO', city: 'Goa', name: 'Madgaon Junction' },
  { code: 'BCT', city: 'Mumbai', name: 'Mumbai Central' },
  { code: 'BBS', city: 'Bhubaneswar', name: 'Bhubaneswar Railway Station' },
  { code: 'ASR', city: 'Amritsar', name: 'Amritsar Junction' }
];
