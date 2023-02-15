import { LocalizationProvider } from "@mui/lab";
import { createAsyncThunk, createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { act } from "@testing-library/react";
import agent from "../../app/api/agent";
import { MetaData } from "../../app/models/pagination";
import { Product, ProductParams } from "../../app/models/product";
import { RootState } from "../../app/store/configureStore";
const querystring = require('querystring');
interface CatalogState {
    productsLoaded: boolean;
    filtersLoaded: boolean;
    productLoaded: boolean;
    status: string;
    brands: string[];
    types: string[];
    productParams: ProductParams;
    metaData: MetaData | null;
  }

const productsAdapter = createEntityAdapter<Product>();

function getAxiosParams(productParams: ProductParams) {
    const params = new URLSearchParams();
    params.append('pageNumber', productParams.pageNumber.toString());
    params.append('pageSize', productParams.pageSize.toString());
    params.append('orderBy', productParams.orderBy);

    if (productParams.searchTerm) params.append('searchTerm', productParams.searchTerm);
    if (productParams.brands?.length > 0) params.append('brands', productParams.brands.toString());
    if (productParams.types?.length > 0) params.append('types', productParams.types.toString());
    return params;
}

function setAxiosParams(queryString: string) {
    return new URLSearchParams(queryString);
}

export const fetchProductsAsyncFromQuery = createAsyncThunk<Product[], string, {state:RootState}> (
    'catalog/fetchProductsAsyncFromQuery',
    async (query, thunkAPI) => {
        const formedQuery = setAxiosParams(query);
        try {
            console.log(formedQuery);
            const response = await agent.Catalog.list(formedQuery);
            thunkAPI.dispatch(setMetaData(response.metaData));
            thunkAPI.dispatch(setHistory(formedQuery.toString()));
            console.log(response.items);
            return response.items;
        } catch(error: any) {
            return thunkAPI.rejectWithValue({
                error: error.data
            })
        }
    }
)

export const fetchProductsAsync = createAsyncThunk<Product[], void, {state:RootState}> (
    'catalog/fetchProductsAsync',
    async (_, thunkAPI) => {

        const params = getAxiosParams(thunkAPI.getState().catalog.productParams);
        try {
            const response = await agent.Catalog.list(params);
            thunkAPI.dispatch(setMetaData(response.metaData));
            thunkAPI.dispatch(setHistory(params.toString()));
            return response.items;
        } catch(error: any) {
            return thunkAPI.rejectWithValue({
                error: error.data
            })
        }
    }
)

export const fetchProductAsync = createAsyncThunk<Product, number> (
    'catalog/fetchProductAsync',
    async (productId, thunkAPI) => {
        try {
            return await agent.Catalog.details(productId)
        } catch(error: any) {
            return thunkAPI.rejectWithValue({
                error: error.data
            })
        }
    }
)

export const fetchFiltersAsync = createAsyncThunk(
    "catalog/fetchFilters",
    async (_, thunkAPI) => {
      try {
        return agent.Catalog.fetchFilters();
      } catch (error: any) {
        return thunkAPI.rejectWithValue({ error: error.data });
      }
    }
  );

  function initParams() {
    return {
        pageNumber: 1,
        pageSize: 6,
        orderBy: 'name',
        brands: [],
        types: []
    }
  }

export const catalogSlice = createSlice({
    name: 'catalog',
    initialState: productsAdapter.getInitialState<CatalogState>({
        productsLoaded: false,
        productLoaded: false,
        filtersLoaded: false,
        status: 'idle',
        brands:[],
        types:[],
        productParams: initParams(),
        metaData: null
    }),
    reducers: {
        setProductParams: (state, action) => {
            state.productsLoaded = false;
            state.productParams = {...state.productParams, ...action.payload, pageNumber: 1};
        },
        setPageNumber: (state, action) => {
            state.productsLoaded = false;
            state.productParams = {...state.productParams, ...action.payload};
        },
        resetProductParams: (state) => {
            state.productParams = initParams();
        },
        setMetaData: (state, action) => {
            state.metaData = action.payload;
        },
        setHistory: (state,action) => {
            console.log(action.payload.toString());
            window.history.replaceState([], "catalog", "/catalog?" + action.payload);
        }
    },
    extraReducers: (builder => {
        builder.addCase(fetchProductsAsync.pending, (state) => {
            state.status = 'pendingFetchProducts'
        });
        builder.addCase(fetchProductsAsyncFromQuery.pending, (state) => {
            state.status = 'pendingFetchProducts'
        });
        builder.addCase(fetchProductsAsync.fulfilled, (state, action) => {
            productsAdapter.setAll(state, action.payload);
            state.status = 'idle';
            state.productsLoaded = true;
        });

        builder.addCase(fetchProductsAsyncFromQuery.fulfilled, (state, action) => {
            productsAdapter.setAll(state, action.payload);
            state.status = 'idle';
            state.productsLoaded = true;
        });
        builder.addCase(fetchProductsAsync.rejected, (state) => {
            state.status = 'idle';
        });
        builder.addCase(fetchProductsAsyncFromQuery.rejected, (state) => {
            state.status = 'idle';
        });
        builder.addCase(fetchProductAsync.pending, (state) => {
            state.status = 'pendingFetchProduct'
        });
        builder.addCase(fetchProductAsync.fulfilled, (state, action) => {
            productsAdapter.upsertOne(state, action.payload)
            state.status = 'idle';
            state.productLoaded = true;
        });
        builder.addCase(fetchProductAsync.rejected, (state) => {
            state.status = 'idle';
        });
        builder.addCase(fetchFiltersAsync.pending, (state) => {
            state.status = 'pendingFetchFilters';
        });
        builder.addCase(fetchFiltersAsync.fulfilled, (state, action) => {
            state.brands = action.payload.brands;
            state.types = action.payload.types;
            state.status = 'idle';
            state.filtersLoaded = true;
        });
        builder.addCase(fetchFiltersAsync.rejected, (state, action) => {
            state.status = 'idle';
        });
    })
})

export const productSelectors = productsAdapter.getSelectors((state: RootState) => state.catalog);
export const {setProductParams, resetProductParams, setMetaData, setPageNumber, setHistory} = catalogSlice.actions;