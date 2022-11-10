import { createAsyncThunk, createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import agent from "../../app/api/agent";
import { Product } from "../../app/models/product";
import { RootState } from "../../app/store/configureStore";

interface CatalogState {
    productsLoaded: boolean;
    filtersLoaded: boolean;
    productLoaded: boolean;
    status: string;
    brands: string[];
    types: string[];
  }

const productsAdapter = createEntityAdapter<Product>();

export const fetchProductsAsync = createAsyncThunk<Product[]> (
    'catalog/fetchProductsAsync',
    async (_, thunkAPI) => {
        try {
            return await agent.Catalog.list();
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

//   initialState: productsAdapter.getInitialState({
//     productsLoaded: false,
//     productLoaded: false,
//     status: 'idle'
// })

// export const catalogSlice = createSlice({
//     name: 'catalog',
//     initialState: productsAdapter.getInitialState<CatalogState>({
//         productsLoaded: false,
//         productLoaded: false,
//         filtersLoaded: false,
//         status: 'idle',
//         brands:[],
//         types:[]
//     })

export const catalogSlice = createSlice({
    name: 'catalog',
    initialState: productsAdapter.getInitialState({
        productsLoaded: false,
        productLoaded: false,
        filtersLoaded: false,
        status: 'idle',
        brands:[],
        types:[]
    }),
    reducers: {},
    extraReducers: (builder => {
        builder.addCase(fetchProductsAsync.pending, (state) => {
            state.status = 'pendingFetchProducts'
        });
        builder.addCase(fetchProductsAsync.fulfilled, (state, action) => {
            productsAdapter.setAll(state, action.payload);
            state.status = 'idle';
            state.productsLoaded = true;
        });
        builder.addCase(fetchProductsAsync.rejected, (state,action) => {
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
        builder.addCase(fetchProductAsync.rejected, (state, action) => {
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